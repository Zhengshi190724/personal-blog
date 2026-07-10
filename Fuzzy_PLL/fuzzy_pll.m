%% 模糊预测智能预测高动态载波跟踪环路 (Fuzzy-PD 架构)
% 场景: 超高动态 (加速度 10g + 加加速度 Jerk 6g/s)
% 核心前沿创新: 采用 fe(频率误差) + dfe(误差变化率) 组成模糊 PD 控制器
clear; clc; close all
set(0, 'defaultAxesFontName', '宋体');
set(0, 'defaultTextFontName', '宋体');
%% 1. 仿真参数与超高动态轨迹设置 (引入 Jerk)
fs = 16.368e6;               
T = 1e-3;               
t_total = 2;            % 延长仿真时间看清 Jerk 的累积效应
N = round(t_total / T); 
fIF = 4.092e6;           
CNo = 40;               
CN0_lin = 10^(CNo/10);
sigma_noise = 1 / sqrt(2 * CN0_lin * T); 

% [新增] 严谨的二次运动学积分轨迹映射
accel_freq = 0;       % 10g 对应的频率一次变化率 (Hz/s)
jerk_freq = 1030;        % 6g/s 对应的频率二次变化率 (Hz/s^2)
time_vec = (0:N-1)*T;
% 真实多普勒频率轨迹 (抛物线)
freq_true = accel_freq * time_vec + 0.5 * jerk_freq * time_vec.^2;
title_str = '10g 加速度 + 6g/s Jerk';

df_init = 100; 
f_nco_init = fIF + df_init;

%% 2. [前沿重构] Fuzzy-PD 控制器设计
fis = newfis('fuzzy_pd_pll');

% 输入1: 频率误差 fe (Hz) 
fis = addvar(fis, 'input', 'fe',[-500 500]);
% [核心创新] 输入2: 频率误差变化率 dfe (Hz/ms) 论域 [-20 20]
fis = addvar(fis, 'input', 'dfe',[-20 20]);
% 输出: 增益倍数 K_fuzzy 论域 [1 10]
fis = addvar(fis, 'output', 'K', [1 10]);

% fe 的隶属函数 (保持不变)
fis = addmf(fis, 'input', 1, 'NB', 'gaussmf', [70 -400]);
fis = addmf(fis, 'input', 1, 'NM', 'gaussmf', [50 -250]);
fis = addmf(fis, 'input', 1, 'NS', 'gaussmf', [30 -100]);
fis = addmf(fis, 'input', 1, 'ZE', 'gaussmf',[20 0]);
fis = addmf(fis, 'input', 1, 'PS', 'gaussmf',[30 100]);
fis = addmf(fis, 'input', 1, 'PM', 'gaussmf', [50 250]);
fis = addmf(fis, 'input', 1, 'PB', 'gaussmf', [70 400]);

% dfe 的隶属函数 (5个等级)
fis = addmf(fis, 'input', 2, 'NB', 'gaussmf', [6 -20]);
fis = addmf(fis, 'input', 2, 'NS', 'gaussmf', [4 -5]);
fis = addmf(fis, 'input', 2, 'ZE', 'gaussmf', [3 0]);
fis = addmf(fis, 'input', 2, 'PS', 'gaussmf', [4 5]);
fis = addmf(fis, 'input', 2, 'PB', 'gaussmf',[6 20]);

% 输出 K 的隶属函数 (5个等级)
fis = addmf(fis, 'output', 1, 'VS', 'gaussmf', [0.8 1]);
fis = addmf(fis, 'output', 1, 'S',  'gaussmf',[1.0 2.5]);
fis = addmf(fis, 'output', 1, 'M',  'gaussmf', [1.5 4.5]);
fis = addmf(fis, 'output', 1, 'B',  'gaussmf', [2.0 7]);
fis = addmf(fis, 'output', 1, 'VB', 'gaussmf', [2.5 10]);

% [核心灵魂]: MacFarlane 对角线阻尼规则矩阵
% 原理: 当误差(fe)和误差变化率(dfe)同号时，说明恶化加剧，输出极大增益(VB)
%       当二者异号时，说明正在快速收敛，提前踩刹车，输出极小增益(VS)
ruleMatrix =[
    5 4 3 2 1;   % fe=NB
    4 3 2 1 2;   % fe=NM
    3 2 1 2 3;   % fe=NS
    3 2 1 2 3;   % fe=ZE 
    3 2 1 2 3;   % fe=PS
    2 1 2 3 4;   % fe=PM
    1 2 3 4 5;   % fe=PB
];
ruleList =[];
for i = 1:7
    for j = 1:5
        ruleList =[ruleList; i j ruleMatrix(i,j) 1 1];
    end
end
fis = addrule(fis, ruleList);
figure;
%subplot(3,1,1);
plotmf(fis, 'input', 1); title('fe 隶属函数'); 
hLines1 = findobj(gca, 'Type', 'line');
set(hLines1, 'Color', [0, 0.4470, 0.7410]);figure;
%subplot(3,1,2);
plotmf(fis, 'input', 2); title('dfe 隶属函数');
hLines2 = findobj(gca, 'Type', 'line');
set(hLines2, 'Color', [0, 0.4470, 0.7410]);figure;
%subplot(3,1,3);
plotmf(fis, 'output', 1); title('K 隶属函数'); 
hLines3 = findobj(gca, 'Type', 'line');
set(hLines3, 'Color', [0, 0.4470, 0.7410]);
figure;
gensurf(fis); title('模糊控制曲面');
%% 3. 初始化 (共享严谨物理基座)
Bn_pll = 18;  wn_pll = Bn_pll / 0.7845;
K1_p = 2.4 * wn_pll / (2*pi); K2_p = 1.1 * wn_pll^2 / (2*pi); K3_p = 1.0 * wn_pll^3 / (2*pi);

Bn_fll = 4;   wn_fll = Bn_fll / 0.53;
K1_f = 1.414 * wn_fll;        K2_f = wn_fll^2;

% 通道状态变量
freq_error_fuzzy = zeros(1, N); phase_error_fuzzy = zeros(1, N); f_nco_record_fuzzy = zeros(1, N);
freq_error_trad = zeros(1, N);  phase_error_trad = zeros(1, N);  f_nco_record_trad = zeros(1, N);

f_nco_fuzzy = f_nco_init; f_nco_trad = f_nco_init;
phase_acc_fuzzy = 0;      phase_acc_trad = 0;
integ_p1_f = 0; integ_p2_f = 0; integ_f1_f = 0; integ_fll_abs_f = 0;
integ_p1_t = 0; integ_p2_t = 0; integ_f1_t = 0; integ_fll_abs_t = 0;
I_prev_f = 0; Q_prev_f = 0; I_prev_t = 0; Q_prev_t = 0;

% [新增] Fuzzy-PD 专属的历史状态记录器
fe_filtered_prev = 0;
dfe_filtered_prev = 0;
alpha_fll = 0.15; 

phi_true = 0;
noise_I = sigma_noise * randn(1, N);
noise_Q = sigma_noise * randn(1, N);

%% 4. 主仿真循环
for k = 1:N
    t = (k-1) * T;
    fd_true = freq_true(k);
    
    % 生成离散严格物理轨迹
    phi_true = phi_true + 2*pi * (fIF + fd_true) * T; 
    signal = exp(1j * phi_true);
    signal_noisy = signal + (noise_I(k) + 1j*noise_Q(k));
    
    %% ==== 通道A: 前沿 Fuzzy-PD 智能预测架构 ====
    phase_acc_fuzzy = phase_acc_fuzzy + 2*pi * f_nco_fuzzy * T;
    z_f = signal_noisy * exp(-1j * phase_acc_fuzzy);
    I_f = real(z_f); Q_f = imag(z_f);
    pe_f = atan2(Q_f, I_f);
    
    if k > 1
        cross_f = I_prev_f * Q_f - I_f * Q_prev_f; dot_f = I_prev_f * I_f + Q_prev_f * Q_f;
        fe_raw = atan2(cross_f, dot_f) / (2*pi*T);
        
        % 平滑频率误差
        fe_filt = alpha_fll * fe_raw + (1 - alpha_fll) * fe_filtered_prev;
        % [核心计算] 提取误差变化率 (微分项)
        dfe_raw = fe_filt - fe_filtered_prev;
        % 对微分项进行轻度滤波防噪
        dfe_filt = 0.2 * dfe_raw + 0.8 * dfe_filtered_prev;
    else
        fe_filt = 0; dfe_filt = 0;
    end
    I_prev_f = I_f; Q_prev_f = Q_f;
    fe_filtered_prev = fe_filt; dfe_filtered_prev = dfe_filt;
    
    % Fuzzy-PD 预测推理
    fe_in = max(min(fe_filt, 500), -500);
    dfe_in = max(min(dfe_filt, 20), -20);
    K_fuzzy = evalfis([fe_in dfe_in], fis);
    
    % 动态放大误差
    fe_scaled = fe_in * K_fuzzy;
    
    % 物理基座更新
    integ_f1_f = integ_f1_f + fe_scaled * T;
    integ_fll_abs_f = integ_fll_abs_f + (K1_f * fe_scaled + K2_f * integ_f1_f) * T;
    integ_p1_f = integ_p1_f + pe_f * T; integ_p2_f = integ_p2_f + integ_p1_f * T;
    y_pll_f = K1_p * pe_f + K2_p * integ_p1_f + K3_p * integ_p2_f;
    
    f_nco_fuzzy = f_nco_init + integ_fll_abs_f + y_pll_f;
    f_nco_record_fuzzy(k) = f_nco_fuzzy;
    freq_error_fuzzy(k) = f_nco_fuzzy - (fIF + fd_true);
    phase_error_fuzzy(k) = pe_f;
    
    %% ==== 通道B: 传统标准 FLL+PLL ====
    phase_acc_trad = phase_acc_trad + 2*pi * f_nco_trad * T;
    z_t = signal_noisy * exp(-1j * phase_acc_trad);
    I_t = real(z_t); Q_t = imag(z_t);
    pe_t = atan2(Q_t, I_t);
    
    if k > 1
        cross_t = I_prev_t * Q_t - I_t * Q_prev_t; dot_t = I_prev_t * I_t + Q_prev_t * Q_t;
        fe_t = atan2(cross_t, dot_t) / (2*pi*T);
    else
        fe_t = 0;
    end
    I_prev_t = I_t; Q_prev_t = Q_t;
    
    integ_f1_t = integ_f1_t + fe_t * T;
    integ_fll_abs_t = integ_fll_abs_t + (K1_f * fe_t + K2_f * integ_f1_t) * T;
    integ_p1_t = integ_p1_t + pe_t * T; integ_p2_t = integ_p2_t + integ_p1_t * T;
    y_pll_t = K1_p * pe_t + K2_p * integ_p1_t + K3_p * integ_p2_t;
    
    f_nco_trad = f_nco_init + integ_fll_abs_t + y_pll_t;
    f_nco_record_trad(k) = f_nco_trad;
    freq_error_trad(k) = f_nco_trad - (fIF + fd_true);
    phase_error_trad(k) = pe_t;
end

%% 5. 绘图与对比分析
time = (0:N-1)*T;

% figure('Color','w');
% plot(time*1000, freq_error_fuzzy, 'b', 'LineWidth', 1.2); hold on;
% plot(time*1000, freq_error_trad, 'r-.', 'LineWidth', 1.0);
% xlabel('时间(ms)'); ylabel('频率误差 (Hz)');
% legend('模糊自适应算法', '传统2阶FLL辅助3阶PLL');
% 
% 
% figure('Color','w');
% plot(time*1000, phase_error_fuzzy*180/pi, 'b', 'LineWidth', 1.2); hold on;
% plot(time*1000, phase_error_trad*180/pi, 'r-.', 'LineWidth', 1.0);
% xlabel('时间(ms)'); ylabel('相位误差(rad)');
% legend('模糊自适应算法', '传统2阶FLL辅助3阶PLL');
% 
% figure('Color','w');
% plot(time*1000, (f_nco_record_fuzzy - fIF), 'b', 'LineWidth', 1.2); hold on;
% plot(time*1000, (f_nco_record_trad - fIF), 'r-.', 'LineWidth', 1.0);
% plot(time*1000, freq_true, 'k--', 'LineWidth', 1.5);
% xlabel('时间(ms)'); ylabel('多普勒频率 (Hz)');
% legend('模糊自适应算法预测轨迹', '传统估算轨迹', '真实多普勒(抛物线)');


% --- 1. 计算两组不同的标记点稀疏间隔 ---
N_points = length(time);
% 第一组：均匀提取约 100 个点（用于图1和图2）
space_idx_1000 = max(1, round(N_points / 1000)); 
mark_idx_1000 = 1 : space_idx_1000 : N_points; 

N_points = length(time);
% 第一组：均匀提取约 300 个点（用于图1和图2）
space_idx_300 = max(1, round(N_points / 300)); 
mark_idx_300 = 1 : space_idx_300 : N_points; 


% 第二组：均匀提取约 40 个点（用于图3）
space_idx_40 = max(1, round(N_points / 200)); 
mark_idx_40 = 1 : space_idx_40 : N_points; 


% --- Figure 1: 频率误差 (100个标记点，大小为3) ---
figure('Color','w');
plot(time*1000, freq_error_fuzzy, 'b-^', 'LineWidth', 1.2, ...
    'MarkerIndices', mark_idx_300, 'MarkerSize', 3, 'MarkerFaceColor', 'b'); 
hold on;
plot(time*1000, freq_error_trad, 'r--o', 'LineWidth', 1.0, ...
    'MarkerIndices', mark_idx_300, 'MarkerSize', 3, 'MarkerFaceColor', 'r');
xlabel('时间/ms'); 
ylabel('频率误差/Hz');
legend('模糊自适应算法', '传统2阶FLL辅助3阶PLL', 'Location', 'best');
grid on; 
set(gca, 'GridLineStyle', '--'); 


% --- Figure 2: 相位误差 (100个标记点，大小为3) ---
figure('Color','w');
plot(time*1000, phase_error_fuzzy*180/pi, 'b-^', 'LineWidth', 1.2, ...
    'MarkerIndices', mark_idx_1000, 'MarkerSize', 3, 'MarkerFaceColor', 'b'); 
hold on;
plot(time*1000, phase_error_trad*180/pi, 'r--o', 'LineWidth', 1.0, ...
    'MarkerIndices', mark_idx_1000, 'MarkerSize', 3, 'MarkerFaceColor', 'r');
xlabel('时间/ms'); 
ylabel('相位误差/rad');
legend('模糊自适应算法', '传统2阶FLL辅助3阶PLL', 'Location', 'best');
grid on;
set(gca, 'GridLineStyle', '--');


% --- Figure 3: 多普勒频率轨迹 (40个标记点，大小为3) ---
figure('Color','w');
plot(time*1000, (f_nco_record_fuzzy - fIF), 'b-^', 'LineWidth', 1.2, ...
    'MarkerIndices', mark_idx_40, 'MarkerSize', 3, 'MarkerFaceColor', 'b'); 
hold on;
plot(time*1000, (f_nco_record_trad - fIF), 'r--o', 'LineWidth', 1.0, ...    
    'MarkerIndices', mark_idx_40, 'MarkerSize', 3, 'MarkerFaceColor', 'r');
plot(time*1000, freq_true, 'k-.', 'LineWidth', 1.5, ...
    'MarkerIndices', mark_idx_40, 'MarkerSize', 3, 'MarkerFaceColor', 'k');
xlabel('时间/ms'); 
ylabel('多普勒频率/Hz');
legend('模糊自适应算法预测轨迹', '传统估算轨迹', '真实多普勒(抛物线)', 'Location', 'best');
grid on;
set(gca, 'GridLineStyle', '--');