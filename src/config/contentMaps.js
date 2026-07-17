export const contentMaps = [
  {
    slug: 'fpga',
    title: 'FPGA',
    eyebrow: 'Digital hardware path',
    description: '从数字逻辑、HDL 到时序约束和板级调试，建立完整的 FPGA 工程能力。',
    stages: [
      { title: '数字逻辑与 HDL', description: '理解组合逻辑、时序逻辑、状态机与可综合 HDL。', tags: ['fpga', 'verilog', 'systemverilog'] },
      { title: '仿真与验证', description: '建立 testbench、断言、覆盖率与自动化回归方法。', tags: ['simulation', 'verification', 'uvm'] },
      { title: '综合与时序', description: '掌握约束、时序分析、跨时钟域和资源优化。', tags: ['timing', 'cdc', 'synthesis'] },
      { title: '板级工程', description: '完成接口联调、片上调试与可复现工程交付。', tags: ['vivado', 'quartus', 'debug'] },
    ],
  },
  {
    slug: 'systemverilog',
    title: 'SystemVerilog',
    eyebrow: 'Verification path',
    description: '从语言数据类型和接口开始，逐步进入约束随机、断言、覆盖率与验证架构。',
    stages: [
      { title: '语言基础', description: '掌握四态逻辑、数组、结构体、过程块和 package。', tags: ['systemverilog'] },
      { title: '面向对象验证', description: '学习 class、继承、随机化、mailbox 与线程同步。', tags: ['oop', 'randomization', 'mailbox'] },
      { title: '断言与覆盖率', description: '用 SVA 和 functional coverage 衡量验证完备性。', tags: ['sva', 'assertion', 'coverage'] },
      { title: 'UVM 工程', description: '组织 agent、scoreboard、sequence 与回归测试。', tags: ['uvm'] },
    ],
  },
  {
    slug: 'dsp',
    title: 'DSP',
    eyebrow: 'Signal processing path',
    description: '从离散信号基础到定点化和 FPGA 实现，连接算法验证与硬件落地。',
    stages: [
      { title: '信号与系统', description: '复习采样、频谱、卷积、相关和系统响应。', tags: ['dsp', 'signal'] },
      { title: '核心算法', description: '掌握 FIR、IIR、FFT、NCO 和数字下变频。', tags: ['fir', 'iir', 'fft', 'nco'] },
      { title: 'MATLAB 验证', description: '建立浮点参考模型、测试向量和指标评估。', tags: ['matlab'] },
      { title: '定点与硬件实现', description: '完成量化分析、流水线设计和资源/精度权衡。', tags: ['fixed-point', 'fpga'] },
    ],
  },
];

function normalize(value) {
  return String(value || '').toLocaleLowerCase('zh-CN');
}

export function getContentMapBySlug(slug) {
  return contentMaps.find((map) => map.slug === slug) || null;
}

export function getPostsForMap(contentMap, posts) {
  if (!contentMap) return [];
  const tags = new Set(contentMap.stages.flatMap((stage) => stage.tags.map(normalize)));
  return posts.filter((post) => post.tags.some((tag) => tags.has(normalize(tag))));
}

export function getPostsForStage(stage, posts) {
  const tags = new Set(stage.tags.map(normalize));
  return posts.filter((post) => post.tags.some((tag) => tags.has(normalize(tag))));
}
