%% 定量性能对比分析脚本
% 三种场景下提取：频率RMSE、频率峰值误差、牵引时间、相位标准差
clear; clc;

%% 公共参数
fs = 16.368e6;
T = 1e-3;
t_total = 2;
N = round(t_total / T);
fIF = 4.092e6;
CNo = 40;
CN0_lin = 10^(CNo/10);
sigma_noise = 1 / sqrt(2 * CN0_lin * T);
df_init = 500;
f_nco_init = fIF + df_init;

% 环路参数
Bn_pll = 18;  wn_pll = Bn_pll / 0.7845;
K1_p = 2.4 * wn_pll / (2*pi); K2_p = 1.1 * wn_pll^2 / (2*pi); K3_p = 1.0 * wn_pll^3 / (2*pi);
Bn_fll = 4;   wn_fll = Bn_fll / 0.53;
K1_f = 1.414 * wn_fll;        K2_f = wn_fll^2;

% 模糊系统 (只建一次)
fis = newfis('fuzzy_pd_pll');
fis = addvar(fis, 'input', 'fe',[-500 500]);
fis = addvar(fis, 'input', 'dfe',[-20 20]);
fis = addvar(fis, 'output', 'K', [1 10]);
fis = addmf(fis, 'input', 1, 'NB', 'gaussmf', [70 -400]);
fis = addmf(fis, 'input', 1, 'NM', 'gaussmf', [50 -250]);
fis = addmf(fis, 'input', 1, 'NS', 'gaussmf', [30 -100]);
fis = addmf(fis, 'input', 1, 'ZE', 'gaussmf',[20 0]);
fis = addmf(fis, 'input', 1, 'PS', 'gaussmf',[30 100]);
fis = addmf(fis, 'input', 1, 'PM', 'gaussmf', [50 250]);
fis = addmf(fis, 'input', 1, 'PB', 'gaussmf', [70 400]);
fis = addmf(fis, 'input', 2, 'NB', 'gaussmf', [6 -20]);
fis = addmf(fis, 'input', 2, 'NS', 'gaussmf', [4 -5]);
fis = addmf(fis, 'input', 2, 'ZE', 'gaussmf', [3 0]);
fis = addmf(fis, 'input', 2, 'PS', 'gaussmf', [4 5]);
fis = addmf(fis, 'input', 2, 'PB', 'gaussmf',[6 20]);
fis = addmf(fis, 'output', 1, 'VS', 'gaussmf', [0.8 1]);
fis = addmf(fis, 'output', 1, 'S',  'gaussmf',[1.0 2.5]);
fis = addmf(fis, 'output', 1, 'M',  'gaussmf', [1.5 4.5]);
fis = addmf(fis, 'output', 1, 'B',  'gaussmf', [2.0 7]);
fis = addmf(fis, 'output', 1, 'VB', 'gaussmf', [2.5 10]);
ruleMatrix =[
    5 4 3 2 1;
    4 3 2 1 2;
    3 2 1 2 3;
    3 2 1 2 3;
    3 2 1 2 3;
    2 1 2 3 4;
    1 2 3 4 5;
];
ruleList =[];
for i = 1:7
    for j = 1:5
        ruleList =[ruleList; i j ruleMatrix(i,j) 1 1];
    end
end
fis = addrule(fis, ruleList);

%% 场景定义 (每一行: {名称, 初始频偏Hz, 加速度Hz/s, 加加速度Hz/s^2})
scenarios = { ...
    '场景一: 50g恒加速度',             100,  2575, 0; ...
    '场景二: 20g/s加加速度',           100,  0,    1030; ...
    '场景三: 50g加速度+20g/s加加速度',  500,  2575, 1030 ...
};

n_scenarios = size(scenarios, 1);
results = cell(n_scenarios, 1);

for s = 1:n_scenarios
    sname       = scenarios{s,1};
    df_init_val = scenarios{s,2};
    accel_val   = scenarios{s,3};
    jerk_val    = scenarios{s,4};

    fprintf('\n===== %s =====\n', sname);

    % 生成轨迹
    time_vec = (0:N-1)*T;
    freq_true = accel_val * time_vec + 0.5 * jerk_val * time_vec.^2;

    f_nco_init_s = fIF + df_init_val;

    % 噪声
    rng(42);  % 固定种子可复现
    noise_I = sigma_noise * randn(1, N);
    noise_Q = sigma_noise * randn(1, N);

    % 初始化 Fuzzy
    freq_error_fuzzy = zeros(1, N); phase_error_fuzzy = zeros(1, N);
    f_nco_record_fuzzy = zeros(1, N);
    f_nco_fuzzy = f_nco_init_s; phase_acc_fuzzy = 0;
    integ_p1_f = 0; integ_p2_f = 0; integ_f1_f = 0; integ_fll_abs_f = 0;
    I_prev_f = 0; Q_prev_f = 0;
    fe_filtered_prev = 0; dfe_filtered_prev = 0;
    alpha_fll = 0.15;

    % 初始化 Traditional
    freq_error_trad = zeros(1, N); phase_error_trad = zeros(1, N);
    f_nco_record_trad = zeros(1, N);
    f_nco_trad = f_nco_init_s; phase_acc_trad = 0;
    integ_p1_t = 0; integ_p2_t = 0; integ_f1_t = 0; integ_fll_abs_t = 0;
    I_prev_t = 0; Q_prev_t = 0;

    phi_true = 0;

    %% 主仿真
    for k = 1:N
        t = (k-1) * T;
        fd_true = freq_true(k);
        phi_true = phi_true + 2*pi * (fIF + fd_true) * T;
        signal = exp(1j * phi_true);
        signal_noisy = signal + (noise_I(k) + 1j*noise_Q(k));

        % --- Fuzzy ---
        phase_acc_fuzzy = phase_acc_fuzzy + 2*pi * f_nco_fuzzy * T;
        z_f = signal_noisy * exp(-1j * phase_acc_fuzzy);
        I_f = real(z_f); Q_f = imag(z_f);
        pe_f = atan2(Q_f, I_f);
        if k > 1
            cross_f = I_prev_f * Q_f - I_f * Q_prev_f;
            dot_f = I_prev_f * I_f + Q_prev_f * Q_f;
            fe_raw = atan2(cross_f, dot_f) / (2*pi*T);
            fe_filt = alpha_fll * fe_raw + (1 - alpha_fll) * fe_filtered_prev;
            dfe_raw = fe_filt - fe_filtered_prev;
            dfe_filt = 0.2 * dfe_raw + 0.8 * dfe_filtered_prev;
        else
            fe_filt = 0; dfe_filt = 0;
        end
        I_prev_f = I_f; Q_prev_f = Q_f;
        fe_filtered_prev = fe_filt; dfe_filtered_prev = dfe_filt;

        fe_in = max(min(fe_filt, 500), -500);
        dfe_in = max(min(dfe_filt, 20), -20);
        K_fuzzy = evalfis([fe_in dfe_in], fis);
        fe_scaled = fe_in * K_fuzzy;

        integ_f1_f = integ_f1_f + fe_scaled * T;
        integ_fll_abs_f = integ_fll_abs_f + (K1_f * fe_scaled + K2_f * integ_f1_f) * T;
        integ_p1_f = integ_p1_f + pe_f * T; integ_p2_f = integ_p2_f + integ_p1_f * T;
        y_pll_f = K1_p * pe_f + K2_p * integ_p1_f + K3_p * integ_p2_f;
        f_nco_fuzzy = f_nco_init_s + integ_fll_abs_f + y_pll_f;
        f_nco_record_fuzzy(k) = f_nco_fuzzy;
        freq_error_fuzzy(k) = f_nco_fuzzy - (fIF + fd_true);
        phase_error_fuzzy(k) = pe_f;

        % --- Traditional ---
        phase_acc_trad = phase_acc_trad + 2*pi * f_nco_trad * T;
        z_t = signal_noisy * exp(-1j * phase_acc_trad);
        I_t = real(z_t); Q_t = imag(z_t);
        pe_t = atan2(Q_t, I_t);
        if k > 1
            cross_t = I_prev_t * Q_t - I_t * Q_prev_t;
            dot_t = I_prev_t * I_t + Q_prev_t * Q_t;
            fe_t = atan2(cross_t, dot_t) / (2*pi*T);
        else
            fe_t = 0;
        end
        I_prev_t = I_t; Q_prev_t = Q_t;
        integ_f1_t = integ_f1_t + fe_t * T;
        integ_fll_abs_t = integ_fll_abs_t + (K1_f * fe_t + K2_f * integ_f1_t) * T;
        integ_p1_t = integ_p1_t + pe_t * T; integ_p2_t = integ_p2_t + integ_p1_t * T;
        y_pll_t = K1_p * pe_t + K2_p * integ_p1_t + K3_p * integ_p2_t;
        f_nco_trad = f_nco_init_s + integ_fll_abs_t + y_pll_t;
        f_nco_record_trad(k) = f_nco_trad;
        freq_error_trad(k) = f_nco_trad - (fIF + fd_true);
        phase_error_trad(k) = pe_t;
    end

    %% 计算指标
    % 排除前10ms瞬态 (前10个采样点)
    skip_idx = 11;
    fe_fuzzy_ss = freq_error_fuzzy(skip_idx:end);
    fe_trad_ss  = freq_error_trad(skip_idx:end);
    pe_fuzzy_ss = phase_error_fuzzy(skip_idx:end);
    pe_trad_ss  = phase_error_trad(skip_idx:end);

    % 1. 频率RMSE (Hz)
    rmse_f = sqrt(mean(fe_fuzzy_ss.^2));
    rmse_t = sqrt(mean(fe_trad_ss.^2));

    % 2. 频率峰值误差 (Hz, 取绝对值最大)
    peak_f = max(abs(fe_fuzzy_ss));
    peak_t = max(abs(fe_trad_ss));

    % 3. 牵引时间: 频率误差首次进入 ±15 Hz 且不再超出
    lock_f = compute_lock_time(freq_error_fuzzy, 15);
    lock_t = compute_lock_time(freq_error_trad, 15);

    % 4. 相位误差标准差 (rad)
    std_pe_f = std(pe_fuzzy_ss);
    std_pe_t = std(pe_trad_ss);

    % 改善百分比
    rmse_improve = (rmse_t - rmse_f) / rmse_t * 100;
    peak_improve = (peak_t - peak_f) / peak_t * 100;
    lock_improve = (lock_t - lock_f) / lock_t * 100;
    std_improve  = (std_pe_t - std_pe_f) / std_pe_t * 100;

    results{s} = struct(...
        'name', sname, ...
        'rmse_f', rmse_f, 'rmse_t', rmse_t, 'rmse_imp', rmse_improve, ...
        'peak_f', peak_f, 'peak_t', peak_t, 'peak_imp', peak_improve, ...
        'lock_f', lock_f, 'lock_t', lock_t, 'lock_imp', lock_improve, ...
        'std_f', std_pe_f, 'std_t', std_pe_t, 'std_imp', std_improve);

    % 打印结果
    fprintf('  指标              模糊自适应      传统方法        改善%%\n');
    fprintf('  频率RMSE/Hz       %8.2f        %8.2f        %5.1f%%\n', rmse_f, rmse_t, rmse_improve);
    fprintf('  频率峰值误差/Hz   %8.2f        %8.2f        %5.1f%%\n', peak_f, peak_t, peak_improve);
    fprintf('  牵引时间/ms       %8.1f        %8.1f        %5.1f%%\n', lock_f, lock_t, lock_improve);
    fprintf('  相位标准差/rad    %8.4f        %8.4f        %5.1f%%\n', std_pe_f, std_pe_t, std_improve);
end

%% 打印汇总表 (可直接复制到论文)
fprintf('\n\n');
fprintf('==================== 表2 三种场景定量性能对比 ====================\n');
fprintf('| 场景 | 算法 | 频率RMSE/Hz | 峰值误差/Hz | 牵引时间/ms | 相位标准差/rad |\n');
fprintf('|------|------|------------|------------|------------|---------------|\n');
for s = 1:n_scenarios
    r = results{s};
    fprintf('| %s | 模糊自适应 | %.2f | %.2f | %.1f | %.4f |\n', ...
        r.name, r.rmse_f, r.peak_f, r.lock_f, r.std_f);
    fprintf('| | 传统FLL+PLL | %.2f | %.2f | %.1f | %.4f |\n', ...
        r.rmse_t, r.peak_t, r.lock_t, r.std_t);
    if s < n_scenarios
        fprintf('|------|------|------------|------------|------------|---------------|\n');
    end
end
fprintf('==================================================================\n');

%% 辅助函数: 计算牵引时间 (滑动窗口RMS首次低于阈值的时刻, ms)
function t_lock = compute_lock_time(error_signal, threshold)
    N = length(error_signal);
    win_len = 50;  % 50ms 滑动窗口
    for k = 1 : N - win_len + 1
        win_rms = sqrt(mean(error_signal(k : k + win_len - 1).^2));
        if win_rms < threshold
            t_lock = (k-1);  % ms
            return;
        end
    end
    t_lock = N-1;  % 未锁定则返回全长
end
