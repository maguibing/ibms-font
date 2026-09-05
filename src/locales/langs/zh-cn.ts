const local: App.I18n.Schema = {
  system: {
    title: {
      pt: '运营平台',
      cp: '集成商平台',
      pj: '项目平台'
    },
    updateTitle: '系统版本更新通知',
    updateContent: '检测到系统有新版本发布，是否立即刷新页面？',
    updateConfirm: '立即刷新',
    updateCancel: '稍后再说'
  },
  systemLog: {
    title: '系统日志',
    deviceTitle: '设备操作日志',
    fields: {
      device: '设备名称',
      point: '点位名称',
      operator: '操作人',
      time: '操作时间',
      operateType: '操作类型',
      operateModule: '操作模块',
      ip: 'IP',
      detail: '操作详情',
      executeResult: '执行结果',
      failReason: '失败原因'
    },
    placeholders: {
      device: '请选择设备',
      point: '请选择点位',
      operator: '请选择操作人',
      operateType: '请选择操作类型',
      operateModule: '请选择操作模块',
      ip: '请输入IP名称'
    },
    result: { success: '成功', failure: '失败' },
    defaultOperator: '系统',
    operateTypeOptions: {
      '1': '登录',
      '2': '登出',
      '3': '导入',
      '4': '导出',
      '5': '创建',
      '6': '更新',
      '7': '删除',
      '8': '分配',
      '9': '审核',
      '100': '其他'
    },
    operateModuleOptions: {
      '1': '系统',
      '2': '用户',
      '3': '部门',
      '4': '角色',
      '5': '项目',
      '6': '边缘设备',
      '7': '设备类型',
      '8': '设备',
      '9': '点位',
      '10': '消息规则',
      '11': '任务',
      '12': '台账',
      '13': '报警',
      '14': '工单',
      '15': '组态',
      '16': '自定义大屏'
    }
  },
  toolbox: {
    title: '系统工具箱',
    description: '网络发现、Ping 测试、Telnet 端口连通性测试',
    downloadApp: '下载安卓包',
    scanDownload: '扫码下载安装包',
    tabs: { discovery: '网络发现', ping: 'Ping 测试', telnet: 'Telnet 测试' },
    result: '测试结果',
    common: {
      host: '目标主机',
      hostPlaceholder: '请输入域名或 IP 地址',
      count: '请求次数',
      timeout: '超时时间',
      port: '端口',
      startTest: '开始测试',
      startConnect: '开始连接',
      elapsed: '耗时 {value} ms',
      ip: '目标 IP',
      latency: '连接延迟',
      success: '成功',
      failure: '失败'
    },
    ping: {
      description: '检测主机连通性和响应延迟',
      targetIp: '目标 IP',
      minLatency: '最小延迟',
      avgLatency: '平均延迟',
      maxLatency: '最大延迟',
      status: '状态',
      steps: { resolve: '解析目标', send: '发送请求', latency: '统计延迟', summary: '汇总结果' },
      sending: '正在发送 Ping 请求',
      failed: 'Ping 测试失败',
      ready: '参数已就绪',
      waiting: '等待输入参数',
      idle: '请输入参数后开始测试',
      running: '正在发送 ICMP 请求，请稍候'
    },
    telnet: {
      description: '检测端口是否可达',
      steps: { resolve: '解析目标', connect: '建立连接', wait: '等待响应', status: '生成状态' },
      connecting: '正在连接 TCP 端口',
      failed: 'Telnet 测试失败',
      ready: '连接参数已就绪',
      waiting: '等待输入参数',
      idle: '请输入连接参数后开始测试',
      running: '正在建立 TCP 连接，请稍候'
    },
    discovery: {
      description: '选择网卡后扫描局域网在线主机',
      interface: '网卡接口',
      interfacePlaceholder: '请选择网卡接口',
      steps: { interface: '确认接口', segment: '解析网段', probe: '探测主机', collect: '汇总结果' },
      scanning: '正在扫描局域网',
      failed: '扫描失败',
      ready: '接口已就绪',
      waiting: '等待选择网卡',
      startWaiting: '等待开始扫描',
      targetWaiting: '选择网卡后展示扫描目标',
      localAddress: '本机地址',
      segment: '扫描网段',
      broadcast: '广播地址',
      target: '扫描目标',
      address: '地址',
      system: '系统',
      empty: '选择网卡后展示接口信息',
      scanningShort: '扫描中',
      start: '开始扫描',
      running: '正在探测可达主机，请稍候',
      scanned: '已扫描 {value}',
      found: '发现 {value}'
    },
    validation: {
      host: '请输入目标主机',
      count: '请求次数不能小于 1',
      timeout: '超时时间不能小于 1ms',
      port: '端口范围为 1-65535'
    },
    status: {
      idle: '等待执行',
      running: '执行中',
      success: '执行成功',
      error: '执行失败',
      requestFailed: '请求失败',
      unknown: '未知状态',
      connected: '连接成功',
      refused: '连接被拒绝',
      timedOut: '连接超时',
      unreachable: '网络不可达',
      dnsFailed: 'DNS 解析失败'
    }
  },
  visualCustomScreen: {
    list: '自定义大屏列表',
    thumbnail: '缩略图',
    name: '大屏名称',
    key: '大屏标识',
    lastSaveUser: '最后保存人',
    lastPublishUser: '最后发布人',
    publishStatus: '发布状态',
    published: '已发布',
    unpublished: '未发布',
    updatedAt: '更新时间',
    design: '设计',
    preview: '预览',
    clone: '克隆',
    cloneTitle: '克隆自定义大屏',
    addTitle: '新增自定义大屏',
    editTitle: '编辑自定义大屏',
    description: '大屏描述',
    namePlaceholder: '请输入大屏名称',
    descriptionPlaceholder: '请输入大屏描述',
    missingKeyDesign: '当前自定义大屏缺少唯一标识，暂时无法进入设计页',
    missingKeyPreview: '当前自定义大屏缺少唯一标识，暂时无法进入预览页'
  },
  visualConfiguration: {
    all: '全部',
    list: '组态列表',
    category: '组态分类',
    emptyCategory: '暂无属性分类',
    categoryName: '分类名称',
    name: '组态名称',
    key: '组态标识',
    description: '组态描述',
    namePlaceholder: '请输入组态名称',
    descriptionPlaceholder: '请输入组态描述',
    categoryPlaceholder: '请选择组态分类',
    parentCategory: '上级分类',
    categoryNamePlaceholder: '请输入分类名称',
    addCategory: '新增属性分类',
    editCategory: '编辑属性分类',
    add: '新增组态',
    edit: '编辑组态',
    clone: '克隆',
    cloneTitle: '克隆组态',
    design: '设计',
    preview: '预览',
    thumbnail: '缩略图',
    lastSaveUser: '最后保存人',
    lastPublishUser: '最后发布人',
    publishStatus: '发布状态',
    published: '已发布',
    unpublished: '未发布',
    updatedAt: '更新时间',
    notPublished: '组态未发布,无法预览'
  },
  visualSysScreenTag: {
    title: '大屏标签',
    realtime: '实时数据',
    export: '导出',
    statusStats: '状态统计',
    changeStats: '变化量统计',
    averageStats: '平均值统计',
    device: '设备名称',
    point: '点位名称',
    pointKey: '点位标识',
    mappingPoint: '映射点位名称',
    selectDevice: '请选择设备',
    selectPoint: '请选择点位',
    selectPointKey: '请选择点位标识',
    mappingPlaceholder: '请输入映射点位名称',
    tagName: '标签名称',
    tagKey: '标签标识',
    scope: '标签范围',
    tagNamePlaceholder: '请输入标签名称',
    tagKeyPlaceholder: '请输入标签标识，如：CHWP',
    scopePlaceholder: '请选择标签范围',
    addTag: '新增大屏标签',
    editTag: '编辑大屏标签',
    addPoint: '新增映射点位',
    editPoint: '编辑映射点位',
    missingScreen: '缺少大屏ID',
    selectTag: '请选择左侧标签',
    noTags: '暂无大屏标签',
    import: '导入',
    taskName: '系统大屏标签点位'
  },
  energy: {
    list: '能耗列表',
    runTime: '运行时间',
    device: '设备名称',
    point: '点位名称',
    date: '统计日期',
    time: '统计时间',
    aggregation: '聚合类型',
    range: '时间范围',
    energyType: '能源类型',
    space: '所属空间',
    selectDevice: '请选择设备',
    selectAggregation: '请选择聚合类型',
    selectEnergyType: '请选择能源类型',
    selectSpace: '请选择所属空间',
    hour: '小时',
    day: '日',
    month: '月',
    year: '年',
    runtimeHour: '运行时间(h)',
    exportName: '能耗列表',
    wsWarning: 'WebSocket 尚未连接，请稍后重试',
    exportSubmitted: '导出任务已提交'
  },
  workorder: {
    list: '工单列表',
    repair: '报修工单',
    deal: '处理工单',
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消',
    system: '系统自动生成',
    orderNo: '工单编号',
    device: '故障设备',
    repairman: '报修人',
    repairPhone: '报修人电话',
    dealer: '处理人',
    dealerPhone: '处理人电话',
    createdAt: '创建时间',
    status: '状态',
    assign: '分配',
    cancelAssign: '取消分配',
    handle: '处理',
    detail: '详情',
    add: '新增工单',
    allocation: '分配工单',
    dealTitle: '处理工单',
    detailTitle: '工单详情',
    selectRepairman: '请选择报修人',
    selectDealer: '请选择处理人',
    selectStatus: '请选择工单状态',
    selectSpace: '请选择所属空间',
    selectDevice: '请选择故障设备',
    selectPoint: '请选择故障点位',
    description: '故障描述',
    descriptionPlaceholder: '请输入故障描述',
    handlingDescription: '处理说明',
    handlingPlaceholder: '请输入处理说明',
    images: '故障图片',
    handlingImages: '处理图片',
    noImages: '暂无图片',
    allocationSuccess: '分配成功',
    cancelAllocationSuccess: '取消分配成功',
    dealSuccess: '处理成功',
    uploadPending: '请等待图片上传完成',
    uploadBreakImage: '请上传故障图片',
    uploadDealImage: '请上传处理图片'
  },
  space: {
    management: '空间管理',
    name: '空间名称',
    key: '空间标识',
    type: '空间类型',
    description: '描述',
    expandAll: '展开全部',
    collapseAll: '折叠全部',
    add: '新增空间',
    edit: '编辑空间',
    parent: '上级空间',
    selectParent: '请选择上级空间',
    selectType: '请选择空间类型',
    namePlaceholder: '请输入空间名称',
    keyPlaceholder: '请输入空间标识',
    descriptionPlaceholder: '请输入描述',
    searchName: '请输入空间名称'
  },
  spaceType: {
    management: '空间类型管理',
    name: '空间类型名称',
    description: '描述',
    createdAt: '创建时间',
    add: '新增空间类型',
    edit: '编辑空间类型',
    namePlaceholder: '请输入空间类型名称',
    descriptionPlaceholder: '请输入描述',
    keywordPlaceholder: '请输入关键字',
    config: '空间类型配置',
    configDescription: '配置表格数据并维护空间基础信息',
    save: '保存',
    export: '导出',
    dataConfig: '数据配置',
    selected: '已选中',
    sheet: '工作表',
    cell: '当前单元格',
    selection: '当前选区',
    content: '单元格内容',
    contentPlaceholder: '点击表格单元格后编辑内容',
    applyTo: '应用到 {value}',
    hint: '点击表格中的任意单元格，右侧会同步显示它的位置和内容。',
    unsaved: '未保存',
    unsavedChanges: '有未保存修改'
  },
  alarmNoticeGroup: {
    management: '通知组管理',
    name: '通知组名称',
    type: '通知类型',
    member: '成员',
    receiver: '接收人',
    way: '通知方式',
    sms: '短信',
    inApp: '站内通知',
    app: 'App 通知',
    description: '描述',
    createdAt: '创建时间',
    add: '新增通知组',
    edit: '编辑通知组',
    namePlaceholder: '请输入通知组名称',
    typePlaceholder: '请选择通知类型',
    receiverPlaceholder: '请选择接收人',
    wayPlaceholder: '请选择通知方式',
    descriptionPlaceholder: '请输入描述'
  },
  alarmRecord: {
    title: '报警记录',
    alarmRule: '报警规则',
    alarmDevice: '报警设备',
    alarmLevel: '报警等级',
    selectAlarmRule: '请选择报警规则',
    selectAlarmLevel: '请选择报警等级',
    alarmContent: '报警内容',
    alarmTime: '报警时间',
    status: '状态',
    pending: '待处理',
    confirmed: '已确认',
    recovered: '已解除',
    confirm: '确认处理',
    recover: '解除',
    generateWorkorder: '生成工单',
    detail: '详情',
    detailTitle: '报警记录详情',
    confirmProcess: '确认处理',
    confirmProcessPrompt: '确认处理该报警记录吗？',
    recoverPrompt: '确认解除该报警记录吗？',
    generateWorkorderPrompt: '确认生成工单吗？',
    confirmSuccess: '确认处理成功',
    recoverSuccess: '解除成功',
    batchConfirmSuccess: '批量确认成功',
    batchRecoverSuccess: '批量解除成功',
    batchConfirm: '批量确认',
    batchRecover: '批量解除',
    batchConfirmPrompt: '确认处理选中的报警记录吗？',
    batchRecoverPrompt: '确认解除选中的报警记录吗？',
    generateWorkorderSuccess: '生成工单成功',
    basicInfo: '基本信息',
    content: '报警内容',
    contentTag: '报警内容',
    noContent: '暂无报警内容',
    operationRecords: '操作记录',
    step: '第 {value} 步',
    operator: '操作人：{value}',
    system: '系统',
    unknownOperator: '未知操作人',
    noOperationRecords: '暂无操作记录',
    noDetail: '暂无报警详情'
  },
  alarmRule: {
    title: '报警规则',
    name: '报警规则名称',
    namePlaceholder: '请输入报警规则名称',
    alarmLevel: '报警等级',
    alarmLevelPlaceholder: '请选择报警等级',
    levelNormal: '普通',
    levelImportant: '重要',
    levelUrgent: '紧急',
    triggerType: '触发类型',
    triggerTypeDevicePointChange: '设备点位变化',
    deviceSourceType: '设备源类型',
    deviceSource: '设备源',
    device: '设备',
    deviceType: '设备类型',
    triggerCondition: '触发条件',
    noticeGroup: '通知组',
    status: '状态',
    statusPlaceholder: '请选择状态',
    add: '新增报警规则',
    edit: '编辑报警规则',
    description: '描述',
    descriptionPlaceholder: '请输入描述',
    noticeSettings: '通知设置',
    noticeGroupPlaceholder: '请选择通知组',
    noticeLimit: '通知限制',
    noticeLimitPlaceholder: '请输入通知限制',
    autoGenerateWorkorder: '自动生成工单',
    systemAutoRecover: '是否系统自动解除',
    validHour: '生效小时',
    enabled: '启用',
    disabled: '停用',
    yes: '是',
    no: '否',
    selectValidHour: '请至少选择一个生效小时',
    durationSecond: '秒',
    durationMinute: '分钟',
    durationHour: '小时',
    duration: '{value}{unit}',
    repeat: '重复{value}次',
    listSeparator: '、',
    hourAriaLabel: '{value}点'
  },
  taskLog: {
    title: '任务日志',
    taskName: '任务名称',
    taskNamePlaceholder: '请输入任务名称',
    taskType: '任务类型',
    taskTypePlaceholder: '请选择任务类型',
    targetDevice: '目标设备',
    executionTime: '执行时间',
    detail: '任务日志详情',
    basicInfo: '基本信息',
    triggerCondition: '触发条件',
    conditionItem: '条件项 {value}',
    triggerDevice: '触发设备',
    triggerPoint: '触发点位',
    executionContent: '执行内容',
    device: '设备',
    point: '点位',
    continuousTimes: '连续次数',
    status: '状态',
    scheduleConfig: '日程配置',
    scheduleType: '调度类型',
    repeatType: '重复类型',
    executionWeekday: '执行星期',
    executionDate: '执行日期',
    executionTimeList: '执行时间',
    dateGroup: '日期组',
    pollingInterval: '轮询间隔',
    calendarBranch: '执行范围',
    inRange: '范围内',
    outOfRange: '范围外',
    timeRange: '时间段',
    action: '执行动作',
    noTriggerPoints: '暂无触发点位',
    noTriggerCondition: '暂无触发条件',
    noScheduleConfig: '暂无日程配置',
    noAction: '暂无执行动作',
    noDetail: '暂无任务日志详情',
    success: '成功',
    failure: '失败',
    taskTypeCondition: '条件任务',
    taskTypeScheduled: '定时任务',
    scheduleOnce: '一次执行',
    schedulePeriodic: '按周期执行',
    scheduleInterval: '间隔时间重复执行',
    scheduleByPlan: '按日程执行',
    scheduleCalendar: '万年历执行',
    sunday: '周日',
    monday: '周一',
    tuesday: '周二',
    wednesday: '周三',
    thursday: '周四',
    friday: '周五',
    saturday: '周六',
    repeatDaily: '每天',
    repeatCustom: '自定义',
    intervalSecond: '秒',
    intervalMinute: '分',
    intervalHour: '小时'
  },
  taskList: {
    title: '任务列表',
    taskName: '任务名称',
    taskNamePlaceholder: '请输入任务名称',
    taskType: '任务类型',
    targetDevice: '目标设备',
    basicInfo: '基本信息',
    scheduleConfig: '日程配置',
    noTriggerCondition: '暂无触发条件',
    noScheduleConfig: '暂无日程配置',
    noAction: '暂无执行动作',
    noDetail: '暂无任务详情',
    deviceSource: '设备来源',
    dataType: '数据类型',
    executionValue: '执行值',
    outOfRangeValue: '范围外值',
    conditionRelation: '条件关系',
    scheduleType: '调度类型',
    repeatMethod: '重复类型',
    dateGroup: '日期组',
    intervalTime: '间隔时间',
    executionDate: '执行日期',
    executionTime: '执行时间',
    delaySeconds: '延迟秒数',
    continuousTimes: '连续次数',
    executeAction: '执行动作',
    status: '状态',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    remark: '备注',
    view: '查看',
    execute: '一键执行',
    executePrompt: '确认执行该任务？',
    executeSuccess: '执行成功',
    detail: '任务详情',
    add: '新增任务',
    edit: '编辑任务',
    taskTypePlaceholder: '请选择任务类型',
    statusPlaceholder: '请选择状态',
    enabled: '启用',
    disabled: '停用',
    descriptionPlaceholder: '请输入备注',
    scheduleSettings: '调度设置',
    executionTimePlaceholder: '请选择执行时间',
    executionWeekday: '执行星期',
    executionTimeNode: '执行时间节点',
    addTimeNode: '新增时间节点',
    deleteTimeNode: '删除时间节点',
    intervalTimePlaceholder: '请输入间隔时间',
    timeUnit: '时间单位',
    addDateGroup: '新增日期组',
    deleteDateGroup: '删除日期组',
    pollingInterval: '轮询间隔',
    pollingIntervalPlaceholder: '请输入轮询间隔',
    seconds: '秒',
    times: '次',
    all: '全选',
    clear: '清空',
    previousYear: '上一年',
    nextYear: '下一年',
    year: '{value} 年',
    month: '{value} 月',
    selectedDays: '已选择 {value} 天',
    executionDatePlaceholder: '请选择执行日期',
    activeTimeRange: '生效时间段',
    editTimeRange: '编辑时间段',
    startTime: '开始时间',
    endTime: '结束时间',
    alignTimeHint: '时间按 5 分钟自动对齐',
    adjustStartTime: '调整开始时间',
    adjustEndTime: '调整结束时间',
    deleteTimeRange: '删除时间段',
    notSelected: '未选择',
    triggerCondition: '触发条件',
    addCondition: '新增条件项',
    conditionItem: '条件项 {value}',
    deleteCondition: '删除条件项',
    relationPlaceholder: '请选择关系',
    pointThreshold: '点位阈值设置',
    addThreshold: '添加阈值',
    pointPlaceholder: '请选择点位',
    thresholdPlaceholder: '请选择阈值',
    deletePoint: '删除点位',
    triggerFrequency: '触发频率',
    duration: '持续时间',
    repeatCount: '重复次数',
    addAction: '新增执行项',
    actionItem: '执行项 {value}',
    deleteAction: '删除执行项',
    executeDevice: '执行设备',
    executePointSettings: '执行点位设置',
    addPoint: '新增点位',
    deviceType: '设备类型',
    deviceTypePlaceholder: '请选择设备类型',
    devicePlaceholder: '请选择设备',
    pointValuePlaceholder: '请输入数值',
    textValuePlaceholder: '请输入文本',
    enumValuePlaceholder: '请选择枚举值',
    minValue: '最小值',
    maxValue: '最大值',
    between: '至',
    calendarAction: '万年历动作',
    addDevice: '新增设备',
    deviceItem: '设备 {value}',
    inside: '范围内',
    outside: '范围外',
    selectPoint: '请选择点位',
    maxConditions: '条件项最多添加 {value} 个',
    maxConditionPoints: '每个条件项最多添加 {value} 个点位条件',
    maxActions: '执行项最多添加 {value} 个',
    maxActionPoints: '每个执行项最多添加 {value} 个执行点位',
    selectDevice: '请选择条件项 {condition} 的触发设备',
    selectActionDevice: '请选择执行项 {value} 的设备',
    duplicatePoint: '执行设备 {value} 存在重复点位',
    pointRangeMismatch: '执行设备 {value} 的范围内外点位必须一致',
    selectActionPoint: '请选择执行项 {action} 的点位 {point}',
    missingDataType: '{prefix}项 {item} 的点位 {point} 缺少数据类型',
    unsupportedThreshold: '{prefix}项 {item} 的点位 {point} 阈值不支持当前数据类型',
    invalidRange: '{prefix}项 {item} 的点位 {point} 范围值需满足最小值小于最大值',
    inputValue: '请输入{prefix}项 {item} 的点位 {point} 的值',
    invalidDelay: '执行项 {value} 的延迟秒数需在 1-300 之间',
    invalidContinuousTimes: '执行项 {value} 的连续次数需在 1-5 之间',
    selectExecutionTime: '请选择执行时间',
    futureExecutionTime: '一次执行时间必须晚于当前时间',
    selectWeekday: '请至少选择一个执行星期',
    positiveIntegerInterval: '间隔时间必须为正整数',
    selectExecutionDate: '请至少选择一个执行日期',
    selectDateGroupDate: '请选择日期组 {value} 的执行日期',
    addDateGroupValidation: '请至少添加一个日期组',
    completeDateGroupTime: '请至少添加日期组 {value} 的时间段',
    validDateGroupTime: '请完善日期组 {group} 的时间段 {range}',
    invalidDateGroupTime: '日期组 {group} 的时间段 {range} 开始时间必须早于结束时间',
    selectExecutionNode: '请至少选择一个执行时间',
    completeExecutionNode: '请完善所有执行时间节点',
    open: '开启',
    close: '关闭',
    to: '至',
    valuePlaceholder: '请输入数值',
    switchValuePlaceholder: '请选择开关值',
    conditionAnd: '且',
    conditionRelationOr: '或',
    conditionOnlyOr: '条件项 {value} 只能使用或关系',
    selectConditionPoint: '请选择条件项 {condition} 的点位 {point}',
    conditionLabel: '条件',
    actionLabel: '执行',
    greaterThan: '大于',
    lessThan: '小于',
    greaterOrEqual: '大于等于',
    lessOrEqual: '小于等于',
    notBetween: '不介于',
    equal: '等于',
    notEqual: '不等于',
    minutes: '分',
    hours: '小时',
    addCalendarDeviceValidation: '请至少添加一个执行设备',
    selectCalendarDevice: '请选择执行设备 {value} 的设备',
    selectCalendarPoint: '请选择执行设备 {value} 的点位',
    duplicateCalendarPoint: '执行设备 {value} 存在重复点位',
    calendarPointRangeMismatch: '执行设备 {value} 的范围内外点位必须一致',
    selectCalendarPointDetail: '请选择执行设备 {action} 的点位 {point}',
    inputCalendarInsideValue: '请输入执行设备 {value} 的范围内值',
    inputCalendarOutsideValue: '请输入执行设备 {value} 的范围外值'
  },
  visualSysScreen: {
    title: '可视化大屏',
    screenTitle: '大屏标题',
    systemName: '系统名称',
    cover: '封面',
    status: '状态',
    createdAt: '创建时间',
    tagManagement: '标签管理',
    edit: '编辑大屏',
    name: '大屏名称',
    namePlaceholder: '请输入大屏名称',
    titlePlaceholder: '请输入大屏标题'
  },
  common: {
    rootDirectory: '根目录',
    action: '操作',
    add: '新增',
    addSuccess: '添加成功',
    backToHome: '返回首页',
    batchDelete: '批量删除',
    import: '导入',
    export: '导出',
    importSuccess: '导入成功',
    importFail: '导入失败',
    importTemplate: '导入模板',
    downloadTemplate: '下载模板',
    importResult: '导入结果',
    importSize: '请上传大小不超过',
    importEnd: '的文件',
    importFormat: '且格式为',
    importTip: '请上传大小不超过',
    exportSuccess: '导出成功',
    exportFail: '导出失败',
    updateExisting: '是否更新已经存在的数据',
    cancel: '取消',
    close: '关闭',
    check: '勾选',
    selectAll: '全选',
    expandColumn: '展开列',
    columnSetting: '列设置',
    config: '配置',
    login: '登录',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    deleteSuccess: '删除成功',
    confirmDelete: '确认删除吗？',
    edit: '编辑',
    download: '下载',
    warning: '警告',
    error: '错误',
    index: '序号',
    keywordSearch: '请输入关键词搜索',
    logout: '退出登录',
    logoutConfirm: '确认退出登录吗？',
    lookForward: '敬请期待',
    modify: '修改',
    modifySuccess: '修改成功',
    noData: '无数据',
    unknown: '未知',
    operate: '操作',
    pleaseCheckValue: '请检查输入的值是否合法',
    refresh: '刷新',
    reset: '重置',
    search: '搜索',
    switch: '切换',
    tip: '提示',
    trigger: '触发',
    update: '更新',
    saveSuccess: '保存成功',
    updateSuccess: '更新成功',
    noChange: '没有进行任何操作',
    userCenter: '个人中心',
    yesOrNo: {
      yes: '是',
      no: '否'
    },
    second: '秒',
    selected: '已选择',
    anyRecords: '条记录',
    clear: '清空',
    noSelectRecord: '未选中任何记录'
  },
  request: {
    logout: '请求失败后登出用户',
    logoutMsg: '用户状态失效，请重新登录',
    logoutWithModal: '请求失败后弹出模态框再登出用户',
    logoutWithModalMsg: '用户状态失效，请重新登录',
    refreshToken: '请求的token已过期，刷新token',
    tokenExpired: 'token已过期'
  },
  theme: {
    themeDrawerTitle: '主题配置',
    tabs: {
      appearance: '外观',
      layout: '布局',
      general: '通用',
      preset: '预设'
    },
    appearance: {
      themeSchema: {
        title: '主题模式',
        light: '亮色模式',
        dark: '暗黑模式',
        auto: '跟随系统'
      },
      grayscale: '灰色模式',
      colourWeakness: '色弱模式',
      themeColor: {
        title: '主题颜色',
        primary: '主色',
        info: '信息色',
        success: '成功色',
        warning: '警告色',
        error: '错误色',
        followPrimary: '跟随主色'
      },
      themeRadius: {
        title: '主题圆角'
      },
      recommendColor: '应用推荐算法的颜色',
      recommendColorDesc: '推荐颜色的算法参照',
      preset: {
        title: '主题预设',
        apply: '应用',
        applySuccess: '预设应用成功',
        default: {
          name: '默认预设',
          desc: '系统默认主题预设'
        },
        soybean: {
          name: 'Soybean',
          desc: 'Soybean 默认主题预设'
        },
        dark: {
          name: '暗色预设',
          desc: '适用于夜间使用的暗色主题预设'
        },
        compact: {
          name: '紧凑型',
          desc: '适用于小屏幕的紧凑布局预设'
        },
        azir: {
          name: 'Azir的预设',
          desc: '是 Azir 比较喜欢的莫兰迪色系冷淡风'
        }
      }
    },
    layout: {
      layoutMode: {
        title: '布局模式',
        vertical: '左侧菜单模式',
        'vertical-mix': '左侧菜单混合模式',
        'vertical-hybrid-header-first': '左侧混合-顶部优先',
        horizontal: '顶部菜单模式',
        'top-hybrid-sidebar-first': '顶部混合-侧边优先',
        'top-hybrid-header-first': '顶部混合-顶部优先',
        vertical_detail: '左侧菜单布局，菜单在左，内容在右。',
        'vertical-mix_detail': '左侧双菜单布局，一级菜单在左侧深色区域，二级菜单在左侧浅色区域。',
        'vertical-hybrid-header-first_detail':
          '左侧混合布局，一级菜单在顶部，二级菜单在左侧深色区域，三级菜单在左侧浅色区域。',
        horizontal_detail: '顶部菜单布局，菜单在顶部，内容在下方。',
        'top-hybrid-sidebar-first_detail': '顶部混合布局，一级菜单在左侧，二级菜单在顶部。',
        'top-hybrid-header-first_detail': '顶部混合布局，一级菜单在顶部，二级菜单在左侧。'
      },
      tab: {
        title: '标签栏设置',
        visible: '显示标签栏',
        cache: '标签栏信息缓存',
        cacheTip: '离开页面后仍然保留标签栏信息',
        height: '标签栏高度',
        mode: {
          title: '标签栏风格',
          slider: '滑块风格',
          chrome: '谷歌风格',
          button: '按钮风格'
        },
        closeByMiddleClick: '鼠标中键关闭标签页',
        closeByMiddleClickTip: '启用后可以使用鼠标中键点击标签页进行关闭'
      },
      header: {
        title: '头部设置',
        height: '头部高度',
        breadcrumb: {
          visible: '显示面包屑',
          showIcon: '显示面包屑图标'
        }
      },
      sider: {
        title: '侧边栏设置',
        inverted: '深色侧边栏',
        width: '侧边栏宽度',
        collapsedWidth: '侧边栏折叠宽度',
        mixWidth: '混合布局侧边栏宽度',
        mixCollapsedWidth: '混合布局侧边栏折叠宽度',
        mixChildMenuWidth: '混合布局子菜单宽度',
        autoSelectFirstMenu: '自动选择第一个子菜单',
        autoSelectFirstMenuTip: '点击一级菜单时，自动选择并导航到第一个子菜单的最深层级'
      },
      footer: {
        title: '底部设置',
        visible: '显示底部',
        fixed: '固定底部',
        height: '底部高度',
        right: '底部居右'
      },
      content: {
        title: '内容区域设置',
        scrollMode: {
          title: '滚动模式',
          tip: '主题滚动仅 main 部分滚动，外层滚动可携带头部底部一起滚动',
          wrapper: '外层滚动',
          content: '主体滚动'
        },
        page: {
          animate: '页面切换动画',
          mode: {
            title: '页面切换动画类型',
            'fade-slide': '滑动',
            fade: '淡入淡出',
            'fade-bottom': '底部消退',
            'fade-scale': '缩放消退',
            'zoom-fade': '渐变',
            'zoom-out': '闪现',
            none: '无'
          }
        },
        fixedHeaderAndTab: '固定头部和标签栏'
      }
    },
    general: {
      title: '通用设置',
      watermark: {
        title: '水印设置',
        visible: '显示全屏水印',
        text: '自定义水印文本',
        enableUserName: '启用用户名水印',
        enableTime: '显示当前时间',
        timeFormat: '时间格式'
      },
      multilingual: {
        title: '多语言设置',
        visible: '显示多语言按钮'
      },
      globalSearch: {
        title: '全局搜索设置',
        visible: '显示全局搜索按钮'
      }
    },
    configOperation: {
      copyConfig: '复制配置',
      copySuccessMsg: '复制成功，请替换 src/theme/settings.ts 中的变量 themeSettings',
      resetConfig: '重置配置',
      resetSuccessMsg: '重置成功'
    },
    tablePropsTitle: '表格配置',
    table: {
      size: {
        title: '表格大小',
        small: '小',
        medium: '中',
        large: '大'
      },
      bordered: '边框',
      bottomBordered: '底部边框',
      singleColumn: '设定行的分割线',
      singleLine: '设定列的分割线',
      striped: '斑马线条纹'
    }
  },
  route: {
    // 公共基础路由
    login: '登录',
    403: '无权限',
    404: '页面不存在',
    500: '服务器错误',
    'iframe-page': '外链页面',
    home: '首页',
    // 运营平台菜单
    datahub: '数据中台',
    datahub_rule: '规则管理',
    menu: '菜单配置',
    menu_platform: '运营菜单管理',
    'menu_platform-menu': '运营菜单管理',
    menu_platform_add: '运营菜单新增',
    menu_platform_edit: '运营菜单编辑',
    menu_platform_delete: '运营菜单删除',
    menu_corp: '集成商菜单管理',
    'menu_corp-menu': '集成商菜单管理',
    menu_corp_add: '集成商菜单新增',
    menu_corp_edit: '集成商菜单编辑',
    menu_corp_delete: '集成商菜单删除',
    menu_project: '项目菜单管理',
    'menu_project-menu': '项目菜单管理',
    menu_project_add: '项目菜单新增',
    menu_project_edit: '项目菜单编辑',
    menu_project_delete: '项目菜单删除',
    global: '全局配置',
    global_industry: '行业类型管理',
    global_industry_add: '行业类型新增',
    global_industry_edit: '行业类型编辑',
    global_industry_delete: '行业类型删除',
    global_screen: '系统大屏管理',
    'global_sys-screen': '系统大屏管理',
    global_sys_screen_add: '系统大屏新增',
    global_sys_screen_edit: '系统大屏编辑',
    global_sys_screen_delete: '系统大屏删除',
    global_activate: '激活码生成',
    global_type_template: '设备类型模板管理',
    'global_device-type-template': '设备类型模板管理',
    global_type_template_detail: '设备类型模板点位管理',
    'global_device-type-template-point': '设备类型模板点位管理',
    global_device_type_template_category_add: '设备类型模板分类新增',
    global_device_type_template_category_edit: '设备类型模板分类编辑',
    global_device_type_template_category_delete: '设备类型模板分类删除',
    global_device_type_template_add: '设备类型模板新增',
    global_device_type_template_edit: '设备类型模板编辑',
    global_device_type_template_delete: '设备类型模板删除',
    global_device_type_template_point_view: '设备类型模板点位查看',
    global_device_type_template_point_add: '设备类型模板点位新增',
    global_device_type_template_point_edit: '设备类型模板点位编辑',
    global_device_type_template_point_delete: '设备类型模板点位删除',
    corp: '集成商配置',
    corp_management: '集成商管理',
    'corp_corp-list': '集成商管理',
    corp_corp_list_add: '集成商新增',
    corp_corp_list_status: '集成商状态流转',
    corp_corp_list_delete: '集成商删除',
    corp_corp_list_view: '集成商查看详情',
    corp_detail: '集成商详情管理',
    'corp_corp-detail': '集成商详情管理',
    corp_version: '版本管理',
    corp_version_add: '版本新增',
    corp_version_edit: '版本编辑',
    corp_version_delete: '版本删除',

    // 集成商平台菜单
    version: '版本配置',
    version_management: '版本管理',
    project: '项目配置',
    project_management: '项目管理',
    project_project_list_add: '项目新增',
    project_project_list_view: '项目查看',
    project_project_list_delete: '项目删除',
    project_detail: '项目详情',

    // 其它业务菜单
    device_configuration: '设备配置',
    device_group_management: '设备分组管理',
    device_type_management: '设备类型管理',
    device_type_detail: '设备类型详情',
    device_management: '设备管理',
    device_detail: '设备详情',
    device_point_management: '设备点位管理',
    physical_point_detail: '物理点位详情',
    virtual_point: '虚拟点位',
    ledger_configuration: '台账配置',
    assets_management: '资产管理',
    assets_type_management: '资产类型管理',
    effroom: '高效机房',
    effroom_overview: '能效概览',
    point_compare: '点位对比',
    energy_calendar: '能源日历',
    rule_configuration: '规则配置',
    message_rule_management: '消息规则管理',
    task_configuration: '任务配置',
    task_management: '任务管理',
    task_log: '任务日志',
    space_configuration: '空间配置',
    space_type_management: '空间类型管理',
    space_management: '空间管理',
    alarm_configuration: '报警配置',
    notice_group_management: '通知组管理',
    alarm_rule_management: '报警规则管理',
    alarm_record_management: '报警记录管理',
    producer: '监控厂家',
    monitor_device: '监控设备',
    player: '视频播放',
    workorder_configuration: '工单配置',
    workorder_management: '工单管理',
    energy: '能耗管理',
    energy_list: '能耗列表',
    energy_runtime: '运行时长',
    visual_configuration: '可视化配置',
    configuration_center: '组态中心',
    sys_screen_management: '系统大屏管理',
    sys_screen_tag: '大屏标签',
    fuxa_management: 'FUXA 管理',
    ioc_management: 'IOC 管理',
    toolbox_management: '工具箱',

    // 多平台公共菜单
    system_configuration: '系统配置',
    user_management: '用户管理',
    dept_management: '部门管理',
    role_management: '角色管理',
    log_management: '日志管理',
    personal_configuration: '个人配置',
    user_center: '个人中心',
    system: '系统管理',
    system_user: '用户管理',
    system_user_add: '用户新增',
    system_user_edit: '用户编辑',
    system_user_delete: '用户删除',
    system_user_password_reset: '用户重置密码',
    system_industry: '行业管理',
    system_role: '角色管理',
    system_role_add: '角色新增',
    system_role_edit: '角色编辑',
    system_role_delete: '角色删除',
    system_role_assign: '角色分配权限',
    system_menu: '菜单管理',
    system_dept: '部门管理',
    system_dept_add: '部门新增',
    system_dept_edit: '部门编辑',
    system_dept_delete: '部门删除',
    system_post: '岗位管理',
    system_toolbox: '工具箱',

    // 其它存量菜单
    monitor: '视频监控',
    monitor_cache: '缓存监控',
    monitor_logininfor: '登录日志',
    monitor_operlog: '操作日志',
    monitor_online: '在线用户',

    // 公共内置路由
    'social-callback': '单点登录回调',
    'user-center': '个人中心',
    exception: '异常页',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500'
  },
  dict: {
    sys_user_sex: {
      male: '男',
      female: '女',
      unknown: '未知'
    },
    sys_show_hide: {
      show: '显示',
      hide: '隐藏'
    },
    sys_normal_disable: {
      normal: '正常',
      disable: '停用'
    },
    sys_yes_no: {
      yes: '是',
      no: '否'
    },
    sys_notice_type: {
      notice: '通知',
      announcement: '公告'
    },
    sys_notice_status: {
      normal: '正常',
      close: '关闭'
    },
    sys_oper_type: {
      insert: '新增',
      update: '修改',
      delete: '删除',
      grant: '授权',
      export: '导出',
      import: '导入',
      force: '强退',
      gencode: '生成代码',
      clean: '清空数据',
      other: '其他'
    },
    sys_common_status: {
      success: '成功',
      fail: '失败'
    },
    sys_grant_type: {
      password: '密码认证',
      sms: '短信认证',
      email: '邮件认证',
      miniapp: '小程序认证',
      social: '三方登录认证'
    },
    sys_device_type: {
      pc: 'PC',
      android: '安卓',
      ios: 'iOS',
      miniapp: '小程序'
    },
    data_type: {
      number: '数值',
      switch: '开关',
      text: '文本',
      enum: '枚举'
    },
    access_level: {
      readOnly: '只读',
      writeOnly: '只写',
      readWrite: '读写'
    },
    wf_business_status: {
      revoked: '已撤销',
      draft: '草稿',
      pending: '待审核',
      completed: '已完成',
      cancelled: '已作废',
      returned: '已退回',
      terminated: '已终止'
    },
    wf_form_type: {
      custom_form: '自定义表单',
      dynamic_form: '动态表单'
    },
    wf_task_status: {
      revoke: '撤销',
      pass: '通过',
      pending_review: '待审核',
      cancel: '作废',
      return: '退回',
      terminate: '终止',
      transfer: '转办',
      delegate: '委托',
      copy: '抄送',
      add_sign: '加签',
      minus_sign: '减签',
      timeout: '超时'
    }
  },
  page: {
    login: {
      common: {
        title: '崇实科技，您身边的AI节能数字化伙伴',
        subTitle: '为客户提供了完整的企业管理解决方案',
        loginOrRegister: '登录 / 注册',
        register: '注册',
        userNamePlaceholder: '请输入用户名',
        phonePlaceholder: '请输入手机号',
        codePlaceholder: '请输入验证码',
        passwordPlaceholder: '请输入密码',
        confirmPasswordPlaceholder: '请再次输入密码',
        sendCodeDesc: '请输入您的手机号，我们将发送验证码到您的手机',
        codeLogin: '验证码登录',
        confirm: '确定',
        back: '返回',
        submit: '提交',
        validateSuccess: '验证成功',
        loginSuccess: '登录成功',
        welcomeBack: '欢迎回来，{userName} ！',
        retryAfter: '{time}s后重试',
        noCaptcha: '暂无验证码',
        noAccount: '您还没有账户？',
        applyCorpEntry: '集成商入驻'
      },
      pwdLogin: {
        title: '密码登录',
        accountTitle: '登录到您的账户',
        accountSubtitle: '欢迎回来！请输入您的账户信息',
        rememberMe: '记住密码',
        forgetPassword: '忘记密码？',
        register: '注册账号',
        otherLoginMode: '其他登录方式',
        selectCorpTitle: '选择集成商',
        selectCorpSubtitle: '请选择本次登录的集成商',
        searchCorpPlaceholder: '搜索集成商或用户名',
        emptyCorp: '暂无匹配集成商',
        selectProjectTitle: '选择项目',
        selectProjectSubtitle: '请选择本次登录的项目',
        searchProjectPlaceholder: '搜索项目',
        emptyProject: '暂无匹配项目',
        projectId: '项目ID：{id}',
        superAdmin: '超级管理员',
        admin: '管理员',
        user: '普通用户'
      },
      codeLogin: {
        title: '验证码登录',
        getCode: '获取验证码',
        reGetCode: '{time}秒后重新获取',
        sendCodeSuccess: '验证码发送成功',
        imageCodePlaceholder: '请输入图片验证码'
      },
      register: {
        title: '项目成员注册',
        subTitle: '请输入项目和账户信息完成注册',
        query: '查询',
        agreement: '我已经仔细阅读并接受',
        protocol: '《用户协议》',
        policy: '《隐私权政策》',
        projectChecked: '项目校验通过',
        projectNotFound: '项目不存在',
        projectNamePlaceholder: '请输入项目名称',
        userNamePlaceholder: '请输入用户名称',
        phoneExists: '手机号已存在，将使用已存在账号',
        registerSuccess: '注册成功',
        form: {
          projectName: {
            required: '项目名称不能为空',
            invalid: '项目名称不能为空'
          },
          userName: {
            required: '用户名称不能为空',
            invalid: '用户名称不能为空'
          }
        }
      },
      resetPwd: {
        title: '重置密码',
        resetSuccess: '密码重置成功，请重新登录',
        codePattern: '请输入4位数字验证码'
      },
      applyCorp: {
        title: '集成商入驻',
        subTitle: '请输入入驻信息，我们将尽快完成审核',
        submitSuccess: '提交成功',
        nameMax: '集成商名称不能超过20个字符',
        addressMax: '详细地址不能超过30个字符',
        phoneExists: '联系电话已存在，将使用已存在账号',
        form: {
          name: {
            required: '集成商名称不能为空',
            invalid: '集成商名称不能为空'
          },
          region: {
            required: '所在地区不能为空',
            invalid: '所在地区不能为空'
          },
          address: {
            required: '详细地址不能为空',
            invalid: '详细地址不能为空'
          },
          contactName: {
            required: '联系人名称不能为空',
            invalid: '联系人名称不能为空'
          },
          contactPhone: {
            required: '联系电话不能为空',
            invalid: '联系电话不能为空'
          },
          password: {
            required: '登录密码不能为空',
            invalid: '登录密码不能为空'
          }
        },
        placeholder: {
          name: '请输入集成商名称',
          region: '请选择所在地区（必填）',
          address: '请输入详细地址',
          contactName: '请输入联系人名称',
          contactPhone: '请输入联系电话',
          password: '登录密码不会显示在系统中，请牢记登录密码',
          confirmPassword: '登录密码不会显示在系统中，请牢记登录密码',
          email: '请输入邮箱(选填)'
        }
      },
      selectList: {
        ariaEnter: '进入{name}',
        backLogin: '返回登录'
      },
      bindWeChat: {
        title: '绑定微信'
      }
    },
    home: {
      branchDesc:
        '为了方便大家开发和更新合并，我们对main分支的代码进行了精简，只保留了首页菜单，其余内容已移至example分支进行维护。预览地址显示的内容即为example分支的内容。',
      greeting: '{userName}, 今天又是充满活力的一天!',
      weatherDesc: '今日多云转晴，20℃ - 25℃!',
      projectCount: '项目数',
      todo: '待办',
      message: '消息',
      areaCount: '区域数',
      registerCount: '注册量',
      schedule: '作息安排',
      study: '学习',
      work: '工作',
      rest: '休息',
      entertainment: '娱乐',
      integratorCount: '集成商数',
      userCount: '用户数',
      dealCount: '成交量',
      projectNews: {
        title: '项目动态',
        moreNews: '更多动态',
        desc1: 'Soybean 在2021年5月28日创建了开源项目 soybean-admin!',
        desc2: 'Yanbowe 向 soybean-admin 提交了一个bug，多标签栏不会自适应。',
        desc3: 'Soybean 准备为 soybean-admin 的发布做充分的准备工作!',
        desc4: 'Soybean 正在忙于为soybean-admin写项目说明文档！',
        desc5: 'Soybean 刚才把工作台页面随便写了一些，凑合能看了！'
      },
      creativity: '创意'
    },
    userCenter: {
      personalInfo: '个人信息',
      basicInfo: '基本资料',
      updatePassword: '修改密码',
      projectLogo: '项目 Logo',
      username: '用户名',
      phoneNumber: '手机号码',
      dept: '所属部门',
      role: '所属角色',
      email: '邮箱',
      gender: '性别',
      oldPassword: '旧密码',
      newPassword: '新密码',
      confirmPassword: '确认密码',
      editAvatar: '修改头像',
      editProjectLogo: '修改项目 Logo',
      selectImage: '选择图片',
      confirmCrop: '确认裁剪',
      form: {
        username: {
          required: '用户名不能为空',
          invalid: '用户名不能为空'
        },
        role: {
          required: '角色不能为空',
          invalid: '角色不能为空'
        },
        oldPassword: {
          required: '旧密码不能为空',
          invalid: '旧密码不能为空'
        },
        newPassword: {
          required: '新密码不能为空',
          invalid: '新密码不能为空'
        },
        confirmPassword: {
          required: '确认密码不能为空',
          invalid: '确认密码不能为空'
        }
      },
      placeholder: {
        nickname: '请输入昵称',
        phone: '请输入手机号',
        dept: '请选择部门',
        role: '请选择角色',
        email: '请输入邮箱',
        oldPassword: '请输入旧密码',
        newPassword: '请输入新密码',
        confirmPassword: '请再次输入新密码'
      },
      message: {
        profileUpdateSuccess: '更新成功',
        passwordMismatch: '两次输入的密码不一致',
        passwordUpdateSuccess: '密码修改成功',
        imageTypeRequired: '请上传图片类型文件（JPG、PNG等）',
        avatarUpdateSuccess: '头像更新成功！',
        projectLogoUpdateSuccess: '项目 Logo 更新成功！'
      }
    },
    common: {
      id: 'ID',
      createBy: '创建者',
      createTime: '创建时间',
      updateBy: '更新者',
      updateTime: '更新时间',
      remark: '备注',
      form: {
        remark: {
          required: '请输入备注',
          invalid: '备注不能为空'
        }
      },
      pointForm: {
        name: '名称',
        key: '标识符',
        dataType: '数据类型',
        unit: '单位',
        defaultValue: '默认值',
        scale: '精度',
        energyType: '能源类型',
        sourceDataType: '源数据类型',
        enumSourceDataType: '枚举源数据类型',
        enumMapping: '枚举映射',
        pointDesc: '点位描述',
        enumValue: '值',
        mappingName: '映射名称',
        mappingLabel: '{value} 映射',
        form: {
          name: {
            required: '请输入点位名称',
            invalid: '点位名称不能为空'
          },
          key: {
            required: '请输入标识符',
            invalid: '标识符不能为空'
          },
          dataType: {
            required: '请选择数据类型',
            invalid: '数据类型不能为空'
          },
          unit: {
            required: '请选择或输入单位(如：kWh、J、dB)',
            invalid: '单位不能为空'
          },
          defaultValue: {
            required: '请输入默认值',
            invalid: '默认值不能为空'
          },
          scale: {
            required: '请选择精度',
            invalid: '精度不能为空'
          },
          energyType: {
            required: '请选择能源类型',
            invalid: '能源类型不能为空'
          },
          sourceDataType: {
            required: '请选择源数据类型',
            invalid: '源数据类型不能为空'
          },
          mappingValue: {
            required: '请输入映射值',
            invalid: '映射值不能为空'
          },
          mappingName: {
            required: '请输入映射名称',
            invalid: '映射名称不能为空'
          },
          enumSourceDataType: {
            required: '请选择枚举源数据类型',
            invalid: '枚举源数据类型不能为空'
          },
          pointDesc: {
            required: '请输入点位描述',
            invalid: '点位描述不能为空'
          }
        },
        options: {
          unitGroups: {
            temperature: '温度',
            humidity: '湿度',
            pressure: '压力',
            electrical: '电气 - 电压/电流',
            powerEnergy: '电气 - 功率/能量',
            resistance: '电气 - 电阻/功率因数',
            flow: '流量',
            volume: '体积',
            length: '长度',
            velocity: '速度',
            frequency: '频率',
            time: '时间',
            mass: '质量',
            light: '光照',
            concentration: '浓度 / 空气质量',
            energy: '能量',
            acousticsWater: '声学 / 水质',
            general: '通用'
          },
          units: {
            celsius: '摄氏度',
            fahrenheit: '华氏度',
            kelvin: '开尔文',
            relativeHumidity: '相对湿度',
            humidityRatio: '克水/千克干空气',
            pascal: '帕斯卡',
            kilopascal: '千帕',
            bar: '巴',
            hectopascal: '百帕',
            millibar: '毫巴',
            psi: '磅力/平方英寸',
            inchWater: '英寸水柱',
            millimeterMercury: '毫米汞柱',
            unit0: '伏特',
            unit1: '毫伏',
            unit2: '千伏',
            unit3: '安培',
            unit4: '毫安',
            unit5: '瓦特',
            unit6: '毫瓦',
            unit7: '千瓦',
            unit8: '兆瓦',
            unit9: '千瓦时',
            unit10: '兆瓦时',
            unit11: '伏安',
            unit12: '千伏安',
            unit13: '无功伏安',
            unit14: '千乏',
            unit15: '欧姆',
            unit16: '毫欧',
            unit17: '千欧',
            unit18: '兆欧',
            unit19: '功率因数',
            unit20: '立方米/秒',
            unit21: '立方米/分钟',
            unit22: '立方米/小时',
            unit23: '升/秒',
            unit24: '升/分钟',
            unit25: '升/小时',
            unit26: '立方英尺/分钟',
            unit27: '立方米',
            unit28: '升',
            unit29: '毫升',
            unit30: '立方英尺',
            unit31: '米',
            unit32: '厘米',
            unit33: '毫米',
            unit34: '千米',
            unit35: '英尺',
            unit36: '英寸',
            unit37: '米/秒',
            unit38: '千米/小时',
            unit39: '英尺/分钟',
            unit40: '赫兹',
            unit41: '千赫兹',
            unit42: '转/分钟',
            unit43: '秒',
            unit44: '毫秒',
            unit45: '分钟',
            unit46: '小时',
            unit47: '天',
            unit48: '千克',
            unit49: '克',
            unit50: '毫克',
            unit51: '吨',
            unit52: '勒克斯',
            unit53: '流明',
            unit54: '英尺烛光',
            unit55: '坎德拉',
            unit56: '百万分比',
            unit57: '十亿分比',
            unit58: '毫克/升',
            unit59: '毫克/立方米',
            unit60: '微克/立方米',
            unit61: '焦耳',
            unit62: '千焦',
            unit63: '兆焦',
            unit64: '瓦时',
            unit65: '英热单位',
            unit66: '分贝',
            unit67: 'A加权分贝',
            unit68: 'pH值',
            unit69: '浊度单位',
            unit70: '百分比',
            unit71: '角度',
            unit72: '弧度',
            unit73: '无单位'
          },
          enumSourceNumber: '数字',
          enumSourceString: '字符',
          precisionNone: '不保留小数',
          precision1: '保留1位小数',
          precision2: '保留2位小数',
          precision3: '保留3位小数',
          energyNone: '无',
          energyElectricity: '电量',
          energyWater: '水量',
          energyGas: '燃气量',
          energyCooling: '冷量',
          energyHeating: '热量',
          energyRuntime: '运行时长'
        },
        message: {
          enumMappingRequired: '请至少配置一组枚举映射'
        }
      }
    },
    corp: {
      common: {
        name: '集成商名称',
        address: '集成商地址',
        region: '所属地区',
        location: '所在地区',
        detailAddress: '详细地址',
        contact: '联系人',
        contactPhone: '联系电话',
        email: '邮箱',
        password: '密码',
        confirmPassword: '确认密码',
        status: '状态',
        useStatus: '使用状态',
        auditStatus: '审核状态',
        view: '查看',
        audit: '审核',
        pass: '通过',
        reject: '拒绝',
        back: '返回',
        enable: '启用',
        disable: '停用',
        auditing: '审核中',
        approved: '已通过',
        rejected: '已拒绝',
        addCorp: '新增集成商',
        form: {
          name: {
            required: '请输入集成商名称',
            invalid: '集成商名称不能为空'
          },
          region: {
            required: '请选择所属地区',
            invalid: '所属地区不能为空'
          },
          detailAddress: {
            required: '请输入详细地址',
            invalid: '详细地址不能为空'
          },
          contact: {
            required: '请输入联系人',
            invalid: '联系人不能为空'
          },
          contactPhone: {
            required: '请输入联系电话',
            invalid: '联系电话不能为空'
          },
          password: {
            required: '请输入密码',
            invalid: '密码不能为空'
          }
        },
        placeholder: {
          companyName: '请输入公司名称',
          email: '请输入邮箱地址',
          password: '登录密码不会显示在系统中，请牢记登录密码，如忘记可重置'
        },
        message: {
          nameMax: '集成商名称不能超过20个字符',
          addressMax: '详细地址不能超过30个字符',
          confirmStatus: '确认{action}该集成商吗？',
          statusUpdateSuccess: '状态修改成功',
          auditPassSuccess: '审核已通过',
          auditRejectSuccess: '审核已拒绝',
          missingCorpId: '缺少集成商ID',
          emptyCorpDetail: '暂无集成商详情'
        }
      },
      list: {
        title: '集成商列表'
      },
      detail: {
        title: '集成商详情',
        versionData: '版本数据'
      },
      version: {
        title: '版本列表',
        name: '名称',
        versionName: '版本名称',
        versionDesc: '版本简介',
        corp: '集成商',
        using: '使用中',
        unassigned: '未分配',
        startTime: '开始时间',
        endTime: '结束时间',
        expectedStartTime: '预计开始时间',
        addVersion: '新增版本',
        editVersion: '编辑版本',
        addExistingVersion: '添加已有版本',
        benefitView: '权益查看',
        renewal: '续费',
        renewalDuration: '请输入续费时长:',
        priceConfig: '价格配置',
        priceBenefit: '价格权益',
        originalPrice: '原价',
        discountPrice: '折扣价',
        duration: '时长',
        resourceConfig: '资源配置',
        deviceCount: '设备数',
        userCount: '用户数',
        dailyMessageCount: '日消息数',
        dataStore: '数据存储',
        dataStoreDuration: '数据存储时长',
        menuConfig: '菜单配置',
        menuPermission: '菜单权限',
        benefitSummary: '权益摘要',
        menuBenefit: '菜单权益',
        allBenefit: '全部权益',
        day: '天',
        month: '月',
        year: '年',
        calendarDay: '日',
        dayDurationUnit: '天',
        monthDurationUnit: '个月',
        yearDurationUnit: '年',
        deviceUnit: '个设备',
        userUnit: '个用户',
        messageUnit: '条',
        countWithUnit: '{count}{unit}',
        dailyMessageBenefit: '{count}条日消息数',
        dataStoreBenefit: '{count}{unit}数据存储',
        priceDurationBenefit: '{count}{unit} ￥{price}',
        menuId: '菜单ID：{id}',
        selectedAddVersions: '已选择 {count} 个待添加版本',
        selectVersion: '请选择需要添加的版本',
        emptyBenefitSummary: '暂无权益摘要',
        emptyMenuBenefit: '暂无菜单权益',
        emptyAllBenefit: '暂无全部权益',
        emptyBenefitData: '暂无权益数据',
        legacy: {
          gatewayManagement: '边缘设备管理',
          energyScreen: '能源大屏',
          meterSetting: '表计设置',
          energyPriceManagement: '用能价格管理',
          energyCategory: '能源分类'
        },
        form: {
          versionName: {
            required: '请输入版本名称',
            invalid: '版本名称不能为空'
          },
          versionDesc: {
            required: '请输入版本简介',
            invalid: '版本简介不能为空'
          },
          corp: {
            required: '请选择集成商',
            invalid: '集成商不能为空'
          },
          expectedStartTime: {
            required: '请选择预计开始时间',
            invalid: '预计开始时间不能为空'
          },
          originalPrice: {
            required: '请输入原价',
            invalid: '原价不能为空'
          },
          discountPrice: {
            required: '请输入折扣价',
            invalid: '折扣价不能为空'
          },
          duration: {
            required: '请输入时长',
            invalid: '时长不能为空'
          },
          deviceCount: {
            required: '请输入设备数',
            invalid: '设备数不能为空'
          },
          userCount: {
            required: '请输入用户数',
            invalid: '用户数不能为空'
          },
          dailyMessageCount: {
            required: '请输入日消息数',
            invalid: '日消息数不能为空'
          },
          dataStoreDuration: {
            required: '请输入数据存储时长',
            invalid: '数据存储时长不能为空'
          },
          renewalDuration: {
            required: '请输入续费时长',
            invalid: '续费时长不能为空'
          }
        },
        message: {
          versionNameMax: '版本名称不能超过10个字符',
          selectMenuRequired: '请至少选择一个菜单',
          renewalSuccess: '续费成功'
        }
      }
    },
    project: {
      list: {
        title: '项目列表',
        projectName: '项目名称',
        key: '标识',
        address: '项目地址',
        leader: '负责人',
        contactPhone: '联系电话',
        version: '版本',
        projectVersion: '项目版本',
        projectStatus: '项目状态',
        view: '查看',
        member: '成员',
        memberName: '成员名称',
        phoneNumber: '手机号',
        addProject: '新增项目',
        editProject: '编辑项目',
        versionViewTitle: '查看项目版本',
        memberTitle: '项目成员',
        memberTitleWithName: '项目成员：{name}',
        currentVersion: '当前版本',
        priceTime: '价格 / 时间',
        versionMenu: '版本菜单',
        platformPassword: '项目平台密码',
        projectDesc: '项目描述',
        leaderPhone: '负责人电话',
        enabled: '启用',
        disabled: '停用',
        form: {
          projectName: {
            required: '项目名称不能为空',
            invalid: '项目名称不能为空'
          },
          key: {
            required: '项目标识不能为空',
            invalid: '项目标识不能为空'
          },
          region: {
            required: '所属地区不能为空',
            invalid: '所属地区不能为空'
          },
          address: {
            required: '详细地址不能为空',
            invalid: '详细地址不能为空'
          },
          version: {
            required: '项目版本不能为空',
            invalid: '项目版本不能为空'
          },
          leader: {
            required: '负责人不能为空',
            invalid: '负责人不能为空'
          },
          contactPhone: {
            required: '联系电话不能为空',
            invalid: '联系电话不能为空'
          },
          platformPassword: {
            required: '项目平台密码不能为空',
            invalid: '项目平台密码不能为空'
          }
        },
        placeholder: {
          projectName: '请输入项目名称',
          key: '请输入项目标识',
          region: '请选择所属地区',
          address: '请输入详细地址',
          version: '请选择项目版本',
          leader: '请选择负责人',
          leaderPhone: '负责人电话',
          password: '密码不会显示在系统中，请牢记登录密码，如忘记可重置密码',
          confirmPassword: '登录密码不会显示在系统中，请牢记登录密码，如忘记可重置密码',
          projectDesc: '请输入项目描述',
          memberName: '请输入成员名称'
        },
        message: {
          projectNameMax: '项目名称不能超过20个字符',
          projectKeyPattern: '项目标识必须以字母开头，且只能包含字母、数字和下划线',
          addressMax: '详细地址不能超过30个字符',
          existingLeaderPhone: '负责人电话已存在，将使用已存在账号',
          statusUpdateSuccess: '状态修改成功',
          unboundVersion: '当前项目未绑定版本',
          emptyVersionMenu: '暂无版本菜单',
          emptyVersionData: '暂无版本数据'
        }
      }
    },
    global: {
      industry: {
        title: '行业管理',
        name: '行业名称',
        sort: '排序号',
        desc: '描述',
        createTime: '创建时间',
        addIndustry: '新增行业',
        editIndustry: '编辑行业',
        form: {
          name: {
            required: '请输入行业名称',
            invalid: '行业名称不能为空'
          },
          sort: {
            required: '请输入排序号',
            invalid: '排序号不能为空'
          },
          desc: {
            required: '请输入描述',
            invalid: '描述不能为空'
          }
        }
      },
      sysScreen: {
        title: '大屏管理',
        name: '大屏名称',
        cover: '大屏封面',
        status: '状态',
        createTime: '创建时间',
        routePath: '路由路径',
        routeName: '路由名称',
        componentPath: '组件路径',
        industryType: '行业类型',
        projectConfig: '项目配置',
        project: '项目',
        mockData: 'Mock数据',
        visual3d: '3D可视化',
        personalInfo: '个人信息',
        enterSystem: '进入系统',
        logout: '退出登录',
        thumbnail: '缩略图',
        addSysScreen: '新增大屏',
        editSysScreen: '修改大屏',
        addProject: '添加项目',
        form: {
          name: {
            required: '请输入大屏名称',
            invalid: '大屏名称不能为空'
          },
          routePath: {
            required: '请输入路由路径',
            invalid: '路由路径不能为空'
          },
          componentPath: {
            required: '请输入组件路径',
            invalid: '组件路径不能为空'
          },
          thumbnail: {
            required: '请上传缩略图',
            invalid: '缩略图不能为空'
          },
          industryType: {
            required: '请选择行业类型',
            invalid: '行业类型不能为空'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          },
          project: {
            required: '请选择项目',
            invalid: '项目不能为空'
          }
        },
        message: {
          projectConfigRequired: '请至少添加一个项目配置',
          projectRequired: '请完善项目ID'
        },
        placeholder: {
          routePathExample: '例如 /smart-waterControl',
          routeNameExample: '例如 SmartWaterControl',
          componentPathExample: '例如 SmartWaterControl/index'
        }
      },
      activate: {
        title: '激活码生成',
        eyebrow: 'SYSTEM LICENSE',
        description: '按顺序选择激活策略并提交，生成结果会在当前页面展示，便于立即复制使用。',
        required: '必选',
        licenseType: '激活类型',
        expireTime: '到期时间',
        strategySpecified: '指定时间',
        strategySpecifiedDesc: '必须选择到期时间，提交真实 Unix 时间戳。',
        strategyPermanent: '永久激活',
        strategyPermanentDesc: '自动忽略时间选择，提交 license_expire_at = 0。',
        stepSelectType: '1. 选择激活类型',
        stepSetExpireTime: '2. 设置到期时间',
        stepGenerate: '3. 生成激活码',
        stepResult: '4. 生成结果',
        resetForm: '重置表单',
        generate: '生成激活码',
        copyLicense: '复制激活码',
        permanentDatePlaceholder: '永久激活无需选择时间',
        datePlaceholder: '请选择到期时间（不可早于当前时间）',
        previewPermanent: '将提交：license_type = 2，license_expire_at = 0（永久激活）',
        previewPending: '将提交：请选择到期时间后生成',
        previewSpecified: '将提交：license_type = 1，license_expire_at = {expireAt}',
        form: {
          licenseType: {
            required: '请选择激活类型',
            invalid: '激活类型不能为空'
          },
          expireTime: {
            required: '请选择到期时间',
            invalid: '到期时间不能为空'
          }
        },
        message: {
          clipboardUnsupported: '您的浏览器不支持 Clipboard API',
          copyFailed: '复制失败，请手动复制',
          copySuccess: '复制成功',
          generateSuccess: '激活码生成成功'
        }
      },
      deviceTypeTemplate: {
        title: '设备类型模板',
        categoryTitle: '设备类型模板分类',
        emptyCategory: '暂无设备类型模板分类',
        name: '设备类型名称',
        key: '标识',
        typeKey: '类型标识',
        icon: '图标',
        status: '状态',
        desc: '描述',
        sort: '排序号',
        categoryName: '分类名称',
        parentCategory: '所属分类',
        updateTime: '更新时间',
        pointManagement: '点位管理',
        addDeviceType: '新增设备类型',
        editDeviceType: '编辑设备类型',
        addCategory: '新增设备类型模板分类',
        editCategory: '编辑设备类型模板分类',
        enable: '启用',
        disable: '停用',
        form: {
          parentCategory: {
            required: '请选择所属分类',
            invalid: '所属分类不能为空'
          },
          name: {
            required: '请输入设备类型名称',
            invalid: '设备类型名称不能为空'
          },
          typeKey: {
            required: '请输入类型标识',
            invalid: '类型标识不能为空'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          },
          categoryName: {
            required: '请输入分类名称',
            invalid: '分类名称不能为空'
          },
          sort: {
            required: '请输入排序号',
            invalid: '排序号不能为空'
          },
          desc: {
            required: '请输入描述',
            invalid: '描述不能为空'
          }
        },
        placeholder: {
          typeKey: '请输入类型标识，如：METER_001'
        },
        message: {
          selectCategory: '请选择左侧分类'
        }
      },
      deviceTypeTemplatePoint: {
        title: '模板点位',
        pointName: '点位名称',
        pointKey: '点位标识',
        dataType: '数据类型',
        desc: '描述',
        updateTime: '更新时间',
        keyword: '点位关键字',
        addPoint: '新增点位',
        editPoint: '编辑点位',
        form: {
          keyword: {
            required: '请输入点位关键字',
            invalid: '点位关键字不能为空'
          }
        },
        message: {
          missingTemplateId: '缺少模板ID',
          missingPointId: '缺少点位ID'
        }
      }
    },
    system: {
      client: {
        title: '客户端列表',
        clientId: '客户端 ID',
        clientKey: '客户端 Key',
        clientSecret: '客户端秘钥',
        grantTypeList: '授权类型',
        deviceType: '设备类型',
        activeTimeout: 'Token 活跃超时时间',
        timeout: 'Token 固定超时',
        status: '状态',
        form: {
          clientId: {
            required: '请输入客户端 ID',
            invalid: '客户端 ID 不能为空'
          },
          clientKey: {
            required: '请输入客户端 Key',
            invalid: '客户端 Key 不能为空'
          },
          clientSecret: {
            required: '请输入客户端秘钥',
            invalid: '客户端秘钥不能为空'
          },
          grantTypeList: {
            required: '请选择授权类型',
            invalid: '授权类型不能为空'
          },
          deviceType: {
            required: '请选择设备类型',
            invalid: '设备类型不能为空'
          },
          activeTimeout: {
            required: '请输入 Token 活跃超时时间',
            invalid: 'Token 活跃超时时间不能为空',
            tooltip: '指定时间无操作则过期(单位：秒), 默认30分钟(1800秒)'
          },
          timeout: {
            required: '请输入 Token 固定超时',
            invalid: 'Token 固定超时不能为空',
            tooltip: '指定时间必定过期(单位：秒)，默认七天(604800秒)'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          }
        },
        addClient: '新增客户端',
        editClient: '编辑客户端'
      },
      config: {
        title: '参数配置列表',
        configName: '参数名称',
        configKey: '参数键名',
        configValue: '参数键值',
        configType: '是否内置',
        remark: '备注',
        createTime: '创建时间',
        refreshCache: '刷新缓存',
        refreshCacheSuccess: '刷新缓存成功',
        form: {
          configId: {
            required: '请输入参数主键',
            invalid: '参数主键不能为空'
          },
          configName: {
            required: '请输入参数名称',
            invalid: '参数名称不能为空'
          },
          configKey: {
            required: '请输入参数键名',
            invalid: '参数键名不能为空'
          },
          configValue: {
            required: '请输入参数键值',
            invalid: '参数键值不能为空'
          },
          configType: {
            required: '请选择是否内置',
            invalid: '是否内置不能为空'
          },
          remark: {
            required: '请输入备注',
            invalid: '备注不能为空'
          }
        },
        addConfig: '新增参数配置',
        editConfig: '编辑参数配置'
      },
      dept: {
        empty: '暂无部门信息',
        title: '部门列表',
        parentId: '上级部门',
        name: '部门名称',
        sort: '排序',
        leader: '负责人',
        createTime: '创建时间',
        expandAll: '全部展开',
        collapseAll: '全部收起',
        form: {
          parentId: {
            required: '请选择上级部门',
            invalid: '上级部门不能为空'
          },
          name: {
            required: '请输入部门名称',
            invalid: '部门名称不能为空'
          },
          sort: {
            required: '请输入排序',
            invalid: '排序不能为空'
          },

          leader: {
            required: '请输入负责人',
            invalid: '负责人不能为空'
          }
        },
        error: {
          getDeptDataFail: '获取部门用户数据失败',
          getDeptUserDataFail: '获取部门用户数据失败'
        },
        placeholder: {
          defaultLeaderPlaceHolder: '请选择负责人',
          addDataLeaderPlaceHolder: '仅在更新时可选择部门负责人',
          deptUserIsEmptyLeaderPlaceHolder: '该部门没有负责人'
        },
        addDept: '新增部门',
        editDept: '编辑部门'
      },
      dict: {
        title: '字典列表',
        dictTypeTitle: '字典类型列表',
        dictName: '字典名称',
        dictType: '字典类型',
        status: '状态',
        remark: '备注',
        createTime: '创建时间',
        refreshCacheSuccess: '刷新缓存成功',
        refreshCache: '刷新缓存',
        confirmDeleteDictType: '确定删除字典类型',
        data: {
          title: '字典数据列表',
          label: '字典标签',
          value: '字典键值',
          dictSort: '字典排序',
          isDefault: '是否默认',
          listClass: '标签样式',
          cssClass: 'CSS样式',
          status: '状态',
          remark: '备注',
          createTime: '创建时间'
        },
        form: {
          dictId: {
            required: '请输入字典主键',
            invalid: '字典主键不能为空'
          },
          dictCode: {
            required: '请输入字典编码',
            invalid: '字典编码不能为空'
          },
          dictName: {
            required: '请输入字典名称',
            invalid: '字典名称不能为空'
          },
          dictType: {
            required: '请输入字典类型',
            invalid: '字典类型不能为空'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          },
          remark: {
            required: '请输入备注',
            invalid: '备注不能为空'
          },
          dictLabel: {
            required: '请输入字典标签',
            invalid: '字典标签不能为空'
          },
          dictValue: {
            required: '请输入字典键值',
            invalid: '字典键值不能为空'
          },
          dictSort: {
            required: '请输入字典排序',
            invalid: '字典排序不能为空'
          },
          isDefault: {
            required: '请选择是否默认',
            invalid: '是否默认不能为空'
          },
          listClass: {
            required: '请选择回显样式',
            invalid: '回显样式不能为空'
          },
          cssClass: {
            required: '请输入样式属性（其他样式扩展）',
            invalid: 'CSS样式不能为空'
          }
        },
        addDict: '新增字典',
        editDict: '编辑字典',
        addDictData: '新增字典数据',
        editDictData: '编辑字典数据',
        addDictType: '新增字典类型',
        editDictType: '编辑字典类型',
        exportDictType: '导出字典类型',
        refreshDictType: '刷新列表',
        dictTypeIsEmpty: '暂无字典类型'
      },
      menu: {
        title: '菜单列表',
        parentId: '上级菜单',
        menuName: '菜单名称',
        buttonName: '按钮名称',
        icon: '菜单图标',
        orderNum: '排序',
        perms: '权限字符',
        permission: '权限标识',
        component: '组件路径',
        path: '路由地址',
        routeName: '路由名称',
        layout: '布局方式',
        defaultLayout: '默认布局',
        blankLayout: '空白布局',
        externalPath: '外链地址',
        extLink: '外链',
        iframe: 'iframe',
        query: '路由参数',
        iframeQuery: 'iframe 地址',
        isFrame: '是否外链',
        isCache: '是否缓存',
        menuType: '菜单类型',
        visible: '显示状态',
        status: '菜单状态',
        createTime: '创建时间',
        cache: '缓存',
        noCache: '不缓存',
        rootName: '根目录',
        buttonPermissionList: '按钮权限列表',
        emptyMenu: '暂无菜单',
        menuDetail: '菜单详情',
        cascadeDeleteContent: '级联删除菜单将删除所选中的菜单，是否继续？',
        expandCollapse: '展开/折叠',
        selectDeselectAll: '全选/反选',
        parentChildCascade: '父子联动',
        isFrameTip: '选择是外链则路由地址需要以`http(s)://`开头',
        isCacheTip: '选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致',
        visibleTip: '选择隐藏则路由将不会出现在侧边栏，但仍然可以访问',
        statusTip: '选择停用则路由将不会出现在侧边栏，也不能被访问',
        permsTip: "控制器中定义的权限字符，如：`{'@'}SaCheckPermission('system:user:list')`",
        componentTip: '访问的组件路径，如：`system/user/index`，默认在`views`目录下',
        pathTip: '访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头',
        layoutTip: '默认布局：具有公共部分的布局，如全局头部、侧边栏、底部等\n空白布局：无公共部分的布局，如登录页',
        form: {
          parentId: {
            required: '请选择上级菜单',
            invalid: '上级菜单不能为空'
          },
          menuType: {
            required: '请选择菜单类型',
            invalid: '菜单类型不能为空'
          },
          menuIds: {
            required: '请选择菜单',
            invalid: '菜单不能为空'
          },
          icon: {
            required: '请选择菜单图标',
            invalid: '菜单图标不能为空'
          },
          menuName: {
            required: '请输入菜单名称',
            invalid: '菜单名称不能为空'
          },
          orderNum: {
            required: '请输入排序',
            invalid: '排序不能为空'
          },
          perms: {
            required: '请输入权限字符',
            invalid: '权限字符不能为空'
          },
          isFrame: {
            required: '请选择是否外链',
            invalid: '是否外链不能为空'
          },
          path: {
            required: '请输入路由地址',
            invalid: '路由地址不能为空'
          },
          routeName: {
            required: '请输入路由名称',
            invalid: '路由名称不能为空'
          },
          component: {
            required: '请输入组件路径',
            invalid: '组件路径不能为空'
          },
          query: {
            required: '请输入路由参数',
            invalid: '路由参数不能为空'
          },
          isCache: {
            required: '请选择是否缓存',
            invalid: '是否缓存不能为空'
          },
          visible: {
            required: '请选择显示状态',
            invalid: '显示状态不能为空'
          },
          status: {
            required: '请选择菜单状态',
            invalid: '菜单状态不能为空'
          },
          permission: {
            required: '请输入权限标识',
            invalid: '权限标识不能为空'
          }
        },
        placeholder: {
          queryKey: '请输入 Key',
          queryValue: '请输入 Value',
          queryIframe: '请输入 iframe 地址'
        },
        directory: '目录',
        menu: '菜单',
        button: '按钮',
        addMenu: '新增菜单',
        addChildMenu: '新增子菜单',
        editMenu: '编辑菜单',
        cascadeDelete: '级联删除菜单'
      },
      notice: {
        title: '通知公告列表',
        noticeTitle: '公告标题',
        noticeType: '公告类型',
        noticeContent: '公告内容',
        status: '状态',
        createTime: '创建时间',
        form: {
          noticeTitle: {
            required: '请输入公告标题',
            invalid: '公告标题不能为空'
          },
          noticeType: {
            required: '请选择公告类型',
            invalid: '公告类型不能为空'
          },
          noticeContent: {
            required: '请输入公告内容',
            invalid: '公告内容不能为空'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          }
        },
        addNotice: '新增公告',
        editNotice: '编辑公告'
      },
      oss: {
        title: '文件列表',
        fileName: '文件名称',
        originalName: '原始名称',
        fileSuffix: '文件后缀',
        url: '文件地址',
        createTime: '创建时间',
        service: '服务商',
        form: {
          file: {
            required: '请选择文件',
            invalid: '文件不能为空'
          }
        },
        upload: '上传文件',
        preview: '预览',
        download: '下载',
        copy: '复制链接',
        copySuccess: '复制成功'
      },
      ossConfig: {
        title: 'OSS配置列表',
        configKey: '配置键',
        accessKey: 'accessKey',
        secretKey: 'secretKey',
        bucketName: '桶名称',
        prefix: '前缀',
        endpoint: '域名',
        domain: '自定义域名',
        isHttps: '是否https',
        region: '地域',
        status: '状态',
        remark: '备注',
        createTime: '创建时间',
        form: {
          configKey: {
            required: '请输入配置键',
            invalid: '配置键不能为空'
          },
          accessKey: {
            required: '请输入accessKey',
            invalid: 'accessKey不能为空'
          },
          secretKey: {
            required: '请输入secretKey',
            invalid: 'secretKey不能为空'
          },
          bucketName: {
            required: '请输入桶名称',
            invalid: '桶名称不能为空'
          },
          prefix: {
            required: '请输入前缀',
            invalid: '前缀不能为空'
          },
          endpoint: {
            required: '请输入域名',
            invalid: '域名不能为空'
          },
          domain: {
            required: '请输入自定义域名',
            invalid: '自定义域名不能为空'
          },
          isHttps: {
            required: '请选择是否https',
            invalid: '是否https不能为空'
          },
          region: {
            required: '请输入地域',
            invalid: '地域不能为空'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          },
          remark: {
            required: '请输入备注',
            invalid: '备注不能为空'
          }
        },
        addOssConfig: '新增OSS配置',
        editOssConfig: '编辑OSS配置'
      },
      post: {
        title: '岗位列表',
        postCode: '岗位编码',
        postName: '岗位名称',
        postSort: '岗位排序',
        status: '状态',
        remark: '备注',
        createTime: '创建时间',
        form: {
          postCode: {
            required: '请输入岗位编码',
            invalid: '岗位编码不能为空'
          },
          postName: {
            required: '请输入岗位名称',
            invalid: '岗位名称不能为空'
          },
          postSort: {
            required: '请输入岗位排序',
            invalid: '岗位排序不能为空'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          },
          remark: {
            required: '请输入备注',
            invalid: '备注不能为空'
          }
        },
        addPost: '新增岗位',
        editPost: '编辑岗位'
      },
      role: {
        title: '角色列表',
        roleName: '角色名称',
        roleKey: '权限字符',
        roleSort: '角色排序',
        roleType: '角色类型',
        desc: '描述',
        status: '状态',
        remark: '备注',
        menuPermission: '菜单权限',
        dataScope: '数据权限',
        dataScopeRange: '数据范围',
        visualPermission: '可视化权限',
        createTime: '创建时间',
        roleTypes: {
          systemAdmin: '系统管理员',
          normalMember: '普通成员'
        },
        dataScopes: {
          all: '全部数据权限',
          self: '仅本人数据权限',
          dept: '本部门数据权限',
          deptAndSub: '本部门及自部门数据权限'
        },
        form: {
          roleName: {
            required: '请输入角色名称',
            invalid: '角色名称不能为空'
          },
          roleKey: {
            required: '请输入权限字符',
            invalid: '权限字符不能为空'
          },
          roleSort: {
            required: '请输入角色排序',
            invalid: '角色排序不能为空'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          },
          remark: {
            required: '请输入备注',
            invalid: '备注不能为空'
          },
          desc: {
            required: '请输入描述',
            invalid: '描述不能为空'
          },
          menuIds: {
            required: '请选择菜单权限',
            invalid: '菜单权限不能为空'
          },
          deptIds: {
            required: '请选择部门权限',
            invalid: '部门权限不能为空'
          }
        },
        addRole: '新增角色',
        editRole: '编辑角色',
        configPermission: '分配权限',
        authorizedUsers: '分配用户',
        selectMenuPermission: '选择菜单权限',
        selectDataScope: '选择数据权限',
        selectDeptPermission: '选择部门权限',
        permissionConfig: '权限配置',
        permissionConfigWithName: '{name} 权限配置',
        visualTypes: {
          systemScreen: '系统大屏',
          configuration: '组态大屏',
          customScreen: '自定义大屏'
        },
        searchScreenName: '搜索大屏名称',
        searchConfigurationName: '搜索组态名称',
        permissionAll: '权限全开',
        controlAll: '控制全开',
        visualPermissionStats: '已授权 {selected} / {total}，可控制 {control}',
        noScreen: '暂无大屏',
        noThumbnail: '暂无缩略图',
        permission: '权限',
        control: '控制'
      },
      tenant: {
        title: '租户列表',
        tenantName: '租户名称',
        tenantId: '租户编号',
        contactUserName: '联系人',
        contactPhone: '联系电话',
        companyName: '公司名称',
        licenseNumber: '营业执照编号',
        address: '地址',
        intro: '企业简介',
        domain: '域名',
        packageId: '租户套餐',
        expireTime: '过期时间',
        accountCount: '账号数量',
        status: '状态',
        createTime: '创建时间',
        form: {
          tenantName: {
            required: '请输入租户名称',
            invalid: '租户名称不能为空'
          },
          contactUserName: {
            required: '请输入联系人',
            invalid: '联系人不能为空'
          },
          contactPhone: {
            required: '请输入联系电话',
            invalid: '联系电话不能为空'
          },
          companyName: {
            required: '请输入公司名称',
            invalid: '公司名称不能为空'
          },
          licenseNumber: {
            required: '请输入营业执照编号',
            invalid: '营业执照编号不能为空'
          },
          address: {
            required: '请输入地址',
            invalid: '地址不能为空'
          },
          intro: {
            required: '请输入企业简介',
            invalid: '企业简介不能为空'
          },
          domain: {
            required: '请输入域名',
            invalid: '域名不能为空'
          },
          packageId: {
            required: '请选择租户套餐',
            invalid: '租户套餐不能为空'
          },
          expireTime: {
            required: '请选择过期时间',
            invalid: '过期时间不能为空'
          },
          accountCount: {
            required: '请输入账号数量',
            invalid: '账号数量不能为空'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          }
        },
        addTenant: '新增租户',
        editTenant: '编辑租户'
      },
      tenantPackage: {
        title: '租户套餐列表',
        packageName: '套餐名称',
        menuIds: '菜单权限',
        remark: '备注',
        status: '状态',
        createTime: '创建时间',
        form: {
          packageName: {
            required: '请输入套餐名称',
            invalid: '套餐名称不能为空'
          },
          menuIds: {
            required: '请选择菜单权限',
            invalid: '菜单权限不能为空'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          },
          remark: {
            required: '请输入备注',
            invalid: '备注不能为空'
          }
        },
        addTenantPackage: '新增租户套餐',
        editTenantPackage: '编辑租户套餐',
        statusChangeSuccess: '状态修改成功'
      },
      user: {
        title: '用户列表',
        userName: '用户名称',
        nickName: '用户昵称',
        deptName: '部门',
        roleName: '角色',
        phonenumber: '手机号码',
        status: '状态',
        createTime: '创建时间',
        password: '密码',
        confirmPassword: '确认密码',
        sex: '性别',
        roleIds: '角色',
        postIds: '岗位',
        email: '邮箱',
        expiredAt: '过期时间',
        expiredAtPlaceholder: '不填为永久',
        avatar: '头像',
        remark: '备注',
        form: {
          userName: {
            required: '请输入用户名称',
            invalid: '用户名称不能为空'
          },
          nickName: {
            required: '请输入用户昵称',
            invalid: '用户昵称不能为空'
          },
          deptId: {
            required: '请选择部门',
            invalid: '部门不能为空'
          },
          phonenumber: {
            required: '请输入手机号码',
            invalid: '手机号码不能为空'
          },
          status: {
            required: '请选择状态',
            invalid: '状态不能为空'
          },
          password: {
            required: '请输入密码',
            invalid: '密码不能为空'
          },
          confirmPassword: {
            required: '请输入确认密码',
            invalid: '确认密码不能为空'
          },
          sex: {
            required: '请选择性别',
            invalid: '性别不能为空'
          },
          roleIds: {
            required: '请选择角色',
            invalid: '角色不能为空'
          },
          postIds: {
            required: '请选择岗位',
            invalid: '岗位不能为空'
          },
          email: {
            required: '请输入邮箱',
            invalid: '邮箱不能为空'
          },
          remark: {
            required: '请输入备注',
            invalid: '备注不能为空'
          }
        },
        addUser: '新增用户',
        editUser: '编辑用户',
        resetPassword: '重置密码',
        resetPasswordConfirmTitle: '重置密码确认',
        resetPasswordConfirmButton: '确认重置',
        resetPasswordConfirmPrefix: '确认将该用户密码重置为 ',
        resetPasswordConfirmSuffix: ' 吗？',
        resetPasswordSuccess: '密码已重置为 {password}',
        importUsers: '导入用户',
        exportTemplate: '导出模板',
        importSuccess: '导入成功',
        statusChangeSuccess: '状态修改成功'
      }
    },
    about: {
      title: '关于',
      introduction: `RuoYi-Plus-Soybean 是一个现代化的企业级多租户管理系统，它结合了 RuoYi-Vue-Plus 的强大后端功能和 Soybean Admin 的现代化前端特性，为开发者提供了完整的企业管理解决方案。`,
      projectInfo: {
        title: '项目信息',
        version: '版本',
        latestBuildTime: '最新构建时间',
        documentLink: '文档地址',
        previewLink: '预览地址',
        repositoryLink: '仓库地址'
      },
      prdDep: '生产依赖',
      devDep: '开发依赖'
    }
  },
  form: {
    required: '不能为空',
    userName: {
      required: '请输入用户名',
      invalid: '用户名格式不正确'
    },
    phone: {
      required: '请输入手机号',
      invalid: '手机号格式不正确'
    },
    pwd: {
      required: '请输入密码',
      invalid: '密码格式不正确，6-18位字符，包含字母、数字、下划线'
    },
    confirmPwd: {
      required: '请输入确认密码',
      invalid: '两次输入密码不一致'
    },
    code: {
      required: '请输入验证码',
      invalid: '验证码格式不正确'
    },
    email: {
      required: '请输入邮箱',
      invalid: '邮箱格式不正确'
    }
  },
  dropdown: {
    closeCurrent: '关闭',
    closeOther: '关闭其它',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '关闭所有',
    pin: '固定标签',
    unpin: '取消固定'
  },
  icon: {
    themeConfig: '主题配置',
    themeSchema: '主题模式',
    lang: '切换语言',
    fullscreen: '全屏',
    fullscreenExit: '退出全屏',
    reload: '刷新页面',
    collapse: '折叠菜单',
    expand: '展开菜单',
    pin: '固定',
    unpin: '取消固定',
    manual: '操作手册'
  },
  datatable: {
    itemCount: '共 {total} 条',
    fixed: {
      left: '左固定',
      right: '右固定',
      unFixed: '取消固定'
    }
  }
};

export default local;
