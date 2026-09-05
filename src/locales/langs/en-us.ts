const local: App.I18n.Schema = {
  system: {
    title: {
      pt: 'Operations Platform',
      cp: 'Integrator Platform',
      pj: 'Project Platform'
    },
    updateTitle: 'System Version Update Notification',
    updateContent: 'A new version of the system has been detected. Do you want to refresh the page immediately?',
    updateConfirm: 'Refresh immediately',
    updateCancel: 'Later'
  },
  systemLog: {
    title: 'System Logs',
    deviceTitle: 'Operation Logs',
    fields: {
      device: 'Device Name',
      point: 'Point Name',
      operator: 'Operator',
      time: 'Operation Time',
      operateType: 'Operation Type',
      operateModule: 'Operation Module',
      ip: 'IP',
      detail: 'Operation Details',
      executeResult: 'Execution Result',
      failReason: 'Failure Reason'
    },
    placeholders: {
      device: 'Please select a device',
      point: 'Please select a point',
      operator: 'Please select an operator',
      operateType: 'Please select an operation type',
      operateModule: 'Please select an operation module',
      ip: 'Please enter an IP name'
    },
    result: { success: 'Success', failure: 'Failure' },
    defaultOperator: 'System',
    operateTypeOptions: {
      '1': 'Login',
      '2': 'Logout',
      '3': 'Import',
      '4': 'Export',
      '5': 'Create',
      '6': 'Update',
      '7': 'Delete',
      '8': 'Assign',
      '9': 'Audit',
      '100': 'Other'
    },
    operateModuleOptions: {
      '1': 'System',
      '2': 'User',
      '3': 'Department',
      '4': 'Role',
      '5': 'Project',
      '6': 'Edge Device',
      '7': 'Device Type',
      '8': 'Device',
      '9': 'Point',
      '10': 'Message Rule',
      '11': 'Task',
      '12': 'Ledger',
      '13': 'Alarm',
      '14': 'Work Order',
      '15': 'Configuration',
      '16': 'Custom Dashboard'
    }
  },
  toolbox: {
    title: 'System Toolbox',
    description: 'Network discovery, Ping test, and Telnet port connectivity test',
    downloadApp: 'Download Android App',
    scanDownload: 'Scan to download installer',
    tabs: { discovery: 'Network Discovery', ping: 'Ping Test', telnet: 'Telnet Test' },
    result: 'Test Result',
    common: {
      host: 'Target Host',
      hostPlaceholder: 'Enter domain or IP address',
      count: 'Request Count',
      timeout: 'Timeout',
      port: 'Port',
      startTest: 'Start Test',
      startConnect: 'Start Connection',
      elapsed: 'Elapsed {value} ms',
      ip: 'Target IP',
      latency: 'Connection Latency',
      success: 'Success',
      failure: 'Failure'
    },
    ping: {
      description: 'Check host connectivity and response latency',
      targetIp: 'Target IP',
      minLatency: 'Minimum Latency',
      avgLatency: 'Average Latency',
      maxLatency: 'Maximum Latency',
      status: 'Status',
      steps: {
        resolve: 'Resolve Target',
        send: 'Send Request',
        latency: 'Measure Latency',
        summary: 'Summarize Result'
      },
      sending: 'Sending Ping request',
      failed: 'Ping test failed',
      ready: 'Parameters ready',
      waiting: 'Waiting for parameters',
      idle: 'Enter parameters to start the test',
      running: 'Sending ICMP request, please wait'
    },
    telnet: {
      description: 'Check whether a port is reachable',
      steps: {
        resolve: 'Resolve Target',
        connect: 'Establish Connection',
        wait: 'Wait for Response',
        status: 'Generate Status'
      },
      connecting: 'Connecting to TCP port',
      failed: 'Telnet test failed',
      ready: 'Connection parameters ready',
      waiting: 'Waiting for parameters',
      idle: 'Enter connection parameters to start the test',
      running: 'Establishing TCP connection, please wait'
    },
    discovery: {
      description: 'Scan online hosts on the LAN after selecting an interface',
      interface: 'Network Interface',
      interfacePlaceholder: 'Please select a network interface',
      steps: {
        interface: 'Confirm Interface',
        segment: 'Resolve Subnet',
        probe: 'Probe Hosts',
        collect: 'Summarize Result'
      },
      scanning: 'Scanning LAN',
      failed: 'Scan failed',
      ready: 'Interface ready',
      waiting: 'Waiting for interface',
      startWaiting: 'Waiting to start scan',
      targetWaiting: 'Select an interface to show scan targets',
      localAddress: 'Local Address',
      segment: 'Scan Subnet',
      broadcast: 'Broadcast Address',
      target: 'Scan Target',
      address: 'Address',
      system: 'System',
      empty: 'Select an interface to show details',
      scanningShort: 'Scanning',
      start: 'Start Scan',
      running: 'Probing reachable hosts, please wait',
      scanned: 'Scanned {value}',
      found: 'Found {value}'
    },
    validation: {
      host: 'Please enter a target host',
      count: 'Request count cannot be less than 1',
      timeout: 'Timeout cannot be less than 1ms',
      port: 'Port must be between 1 and 65535'
    },
    status: {
      idle: 'Waiting',
      running: 'In Progress',
      success: 'Success',
      error: 'Failed',
      requestFailed: 'Request failed',
      unknown: 'Unknown status',
      connected: 'Connection successful',
      refused: 'Connection refused',
      timedOut: 'Connection timed out',
      unreachable: 'Network unreachable',
      dnsFailed: 'DNS resolution failed'
    }
  },
  visualCustomScreen: {
    list: 'Custom Screen List',
    thumbnail: 'Thumbnail',
    name: 'Screen Name',
    key: 'Screen Identifier',
    lastSaveUser: 'Last Saved By',
    lastPublishUser: 'Last Published By',
    publishStatus: 'Publish Status',
    published: 'Published',
    unpublished: 'Unpublished',
    updatedAt: 'Updated At',
    design: 'Design',
    preview: 'Preview',
    clone: 'Clone',
    cloneTitle: 'Clone Custom Screen',
    addTitle: 'Add Custom Screen',
    editTitle: 'Edit Custom Screen',
    description: 'Screen Description',
    namePlaceholder: 'Please enter a screen name',
    descriptionPlaceholder: 'Please enter a screen description',
    missingKeyDesign: 'This custom screen has no identifier and cannot be opened in design mode',
    missingKeyPreview: 'This custom screen has no identifier and cannot be opened in preview mode'
  },
  visualConfiguration: {
    all: 'All',
    list: 'Configuration List',
    category: 'Configuration Categories',
    emptyCategory: 'No attribute categories',
    categoryName: 'Category Name',
    name: 'Configuration Name',
    key: 'Configuration Identifier',
    description: 'Configuration Description',
    namePlaceholder: 'Please enter a configuration name',
    descriptionPlaceholder: 'Please enter a configuration description',
    categoryPlaceholder: 'Please select a configuration category',
    parentCategory: 'Parent Category',
    categoryNamePlaceholder: 'Please enter a category name',
    addCategory: 'Add Attribute Category',
    editCategory: 'Edit Attribute Category',
    add: 'Add Configuration',
    edit: 'Edit Configuration',
    clone: 'Clone',
    cloneTitle: 'Clone Configuration',
    design: 'Design',
    preview: 'Preview',
    thumbnail: 'Thumbnail',
    lastSaveUser: 'Last Saved By',
    lastPublishUser: 'Last Published By',
    publishStatus: 'Publish Status',
    published: 'Published',
    unpublished: 'Unpublished',
    updatedAt: 'Updated At',
    notPublished: 'Configuration is not published and cannot be previewed'
  },
  visualSysScreenTag: {
    title: 'Screen Tags',
    realtime: 'Realtime Data',
    export: 'Export',
    statusStats: 'Status Statistics',
    changeStats: 'Change Statistics',
    averageStats: 'Average Statistics',
    device: 'Device Name',
    point: 'Point Name',
    pointKey: 'Point Identifier',
    mappingPoint: 'Mapped Point Name',
    selectDevice: 'Please select a device',
    selectPoint: 'Please select a point',
    selectPointKey: 'Please select a point identifier',
    mappingPlaceholder: 'Please enter a mapped point name',
    tagName: 'Tag Name',
    tagKey: 'Tag Identifier',
    scope: 'Tag Scope',
    tagNamePlaceholder: 'Please enter a tag name',
    tagKeyPlaceholder: 'Please enter a tag identifier, e.g. CHWP',
    scopePlaceholder: 'Please select a tag scope',
    addTag: 'Add Screen Tag',
    editTag: 'Edit Screen Tag',
    addPoint: 'Add Mapped Point',
    editPoint: 'Edit Mapped Point',
    missingScreen: 'Missing screen ID',
    selectTag: 'Please select a tag on the left',
    noTags: 'No screen tags',
    import: 'Import',
    taskName: 'System Screen Tag Points'
  },
  energy: {
    list: 'Energy List',
    runTime: 'Runtime',
    device: 'Device Name',
    point: 'Point Name',
    date: 'Statistics Date',
    time: 'Statistics Time',
    aggregation: 'Aggregation Type',
    range: 'Time Range',
    energyType: 'Energy Type',
    space: 'Space',
    selectDevice: 'Please select a device',
    selectAggregation: 'Please select an aggregation type',
    selectEnergyType: 'Please select an energy type',
    selectSpace: 'Please select a space',
    hour: 'Hour',
    day: 'Day',
    month: 'Month',
    year: 'Year',
    runtimeHour: 'Runtime (h)',
    exportName: 'Energy List',
    wsWarning: 'WebSocket is not connected. Please try again later',
    exportSubmitted: 'Export task submitted'
  },
  workorder: {
    list: 'Work Order List',
    repair: 'Repair',
    deal: 'Processing',
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    system: 'System Generated',
    orderNo: 'Work Order No.',
    device: 'Fault Device',
    repairman: 'Reporter',
    repairPhone: 'Reporter Phone',
    dealer: 'Handler',
    dealerPhone: 'Handler Phone',
    createdAt: 'Created At',
    status: 'Status',
    assign: 'Assign',
    cancelAssign: 'Cancel Assignment',
    handle: 'Process',
    detail: 'Details',
    add: 'Add Work Order',
    allocation: 'Assign Work Order',
    dealTitle: 'Process Work Order',
    detailTitle: 'Work Order Details',
    selectRepairman: 'Please select a reporter',
    selectDealer: 'Please select a handler',
    selectStatus: 'Please select a work order status',
    selectSpace: 'Please select a space',
    selectDevice: 'Please select a fault device',
    selectPoint: 'Please select a fault point',
    description: 'Fault Description',
    descriptionPlaceholder: 'Please enter a fault description',
    handlingDescription: 'Handling Notes',
    handlingPlaceholder: 'Please enter handling notes',
    images: 'Fault Images',
    handlingImages: 'Handling Images',
    noImages: 'No images',
    allocationSuccess: 'Assigned successfully',
    cancelAllocationSuccess: 'Assignment cancelled successfully',
    dealSuccess: 'Processed successfully',
    uploadPending: 'Please wait for image upload to complete',
    uploadBreakImage: 'Please upload fault images',
    uploadDealImage: 'Please upload handling images'
  },
  space: {
    management: 'Space Management',
    name: 'Space Name',
    key: 'Space Identifier',
    type: 'Space Type',
    description: 'Description',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
    add: 'Add Space',
    edit: 'Edit Space',
    parent: 'Parent Space',
    selectParent: 'Please select a parent space',
    selectType: 'Please select a space type',
    namePlaceholder: 'Please enter a space name',
    keyPlaceholder: 'Please enter a space identifier',
    descriptionPlaceholder: 'Please enter a description',
    searchName: 'Please enter a space name'
  },
  spaceType: {
    management: 'Space Type Management',
    name: 'Space Type Name',
    description: 'Description',
    createdAt: 'Created At',
    add: 'Add Space Type',
    edit: 'Edit Space Type',
    namePlaceholder: 'Please enter a space type name',
    descriptionPlaceholder: 'Please enter a description',
    keywordPlaceholder: 'Please enter a keyword',
    config: 'Space Type Configuration',
    configDescription: 'Configure table data and maintain basic space information',
    save: 'Save',
    export: 'Export',
    dataConfig: 'Data Configuration',
    selected: 'Selected',
    sheet: 'Worksheet',
    cell: 'Current Cell',
    selection: 'Current Selection',
    content: 'Cell Content',
    contentPlaceholder: 'Click a cell to edit its content',
    applyTo: 'Apply to {value}',
    hint: 'Click any cell in the table to show its position and content here.',
    unsaved: 'Unsaved',
    unsavedChanges: 'Unsaved changes'
  },
  alarmNoticeGroup: {
    management: 'Notice Group Management',
    name: 'Notice Group Name',
    type: 'Notice Type',
    member: 'Member',
    receiver: 'Recipients',
    way: 'Notification Method',
    sms: 'SMS',
    inApp: 'In-app Notification',
    app: 'App Notification',
    description: 'Description',
    createdAt: 'Created At',
    add: 'Add Notice Group',
    edit: 'Edit Notice Group',
    namePlaceholder: 'Please enter a notice group name',
    typePlaceholder: 'Please select a notice type',
    receiverPlaceholder: 'Please select recipients',
    wayPlaceholder: 'Please select a notification method',
    descriptionPlaceholder: 'Please enter a description'
  },
  alarmRecord: {
    title: 'Alarm Records',
    alarmRule: 'Alarm Rule',
    alarmDevice: 'Alarm Device',
    alarmLevel: 'Alarm Level',
    selectAlarmRule: 'Please select an alarm rule',
    selectAlarmLevel: 'Please select an alarm level',
    alarmContent: 'Alarm Content',
    alarmTime: 'Alarm Time',
    status: 'Status',
    pending: 'Pending',
    confirmed: 'Confirmed',
    recovered: 'Recovered',
    confirm: 'Acknowledge',
    recover: 'Recover',
    generateWorkorder: 'Create Work Order',
    detail: 'Details',
    detailTitle: 'Alarm Record Details',
    confirmProcess: 'Acknowledge',
    confirmProcessPrompt: 'Acknowledge this alarm record?',
    recoverPrompt: 'Recover this alarm record?',
    generateWorkorderPrompt: 'Create a work order?',
    confirmSuccess: 'Alarm acknowledged successfully',
    recoverSuccess: 'Alarm recovered successfully',
    batchConfirmSuccess: 'Alarms acknowledged successfully',
    batchRecoverSuccess: 'Alarms recovered successfully',
    batchConfirm: 'Batch Acknowledge',
    batchRecover: 'Batch Recover',
    batchConfirmPrompt: 'Acknowledge the selected alarm records?',
    batchRecoverPrompt: 'Recover the selected alarm records?',
    generateWorkorderSuccess: 'Work order created successfully',
    basicInfo: 'Basic Information',
    content: 'Alarm Content',
    contentTag: 'Alarm Content',
    noContent: 'No alarm content',
    operationRecords: 'Operation Records',
    step: 'Step {value}',
    operator: 'Operator: {value}',
    system: 'System',
    unknownOperator: 'Unknown operator',
    noOperationRecords: 'No operation records',
    noDetail: 'No alarm details'
  },
  alarmRule: {
    title: 'Alarm Rules',
    name: 'Alarm Rule Name',
    namePlaceholder: 'Please enter an alarm rule name',
    alarmLevel: 'Alarm Level',
    alarmLevelPlaceholder: 'Please select an alarm level',
    levelNormal: 'Normal',
    levelImportant: 'Important',
    levelUrgent: 'Urgent',
    triggerType: 'Trigger Type',
    triggerTypeDevicePointChange: 'Device Point Change',
    deviceSourceType: 'Device Source Type',
    deviceSource: 'Device Source',
    device: 'Device',
    deviceType: 'Device Type',
    triggerCondition: 'Trigger Condition',
    noticeGroup: 'Notice Group',
    status: 'Status',
    statusPlaceholder: 'Please select a status',
    add: 'Add Alarm Rule',
    edit: 'Edit Alarm Rule',
    description: 'Description',
    descriptionPlaceholder: 'Please enter a description',
    noticeSettings: 'Notification Settings',
    noticeGroupPlaceholder: 'Please select a notice group',
    noticeLimit: 'Notification Limit',
    noticeLimitPlaceholder: 'Please enter a notification limit',
    autoGenerateWorkorder: 'Automatically Create Work Order',
    systemAutoRecover: 'Automatically Recover by System',
    validHour: 'Active Hours',
    enabled: 'Enabled',
    disabled: 'Disabled',
    yes: 'Yes',
    no: 'No',
    selectValidHour: 'Please select at least one active hour',
    durationSecond: 'seconds',
    durationMinute: 'minutes',
    durationHour: 'hours',
    duration: '{value} {unit}',
    repeat: 'Repeat {value} times',
    listSeparator: ', ',
    hourAriaLabel: '{value}:00'
  },
  taskLog: {
    title: 'Task Logs',
    taskName: 'Task Name',
    taskNamePlaceholder: 'Please enter a task name',
    taskType: 'Task Type',
    taskTypePlaceholder: 'Please select a task type',
    targetDevice: 'Target Device',
    executionTime: 'Execution Time',
    detail: 'Task Log Details',
    basicInfo: 'Basic Information',
    triggerCondition: 'Trigger Condition',
    conditionItem: 'Condition {value}',
    triggerDevice: 'Trigger Device',
    triggerPoint: 'Trigger Point',
    executionContent: 'Execution Content',
    device: 'Device',
    point: 'Point',
    continuousTimes: 'Consecutive Times',
    status: 'Status',
    scheduleConfig: 'Schedule Configuration',
    scheduleType: 'Schedule Type',
    repeatType: 'Repeat Type',
    executionWeekday: 'Execution Weekday',
    executionDate: 'Execution Date',
    executionTimeList: 'Execution Time',
    dateGroup: 'Date Group',
    pollingInterval: 'Polling Interval',
    calendarBranch: 'Branch',
    inRange: 'In Range',
    outOfRange: 'Out of Range',
    timeRange: 'Time Range',
    action: 'Execution Action',
    noTriggerPoints: 'No trigger points',
    noTriggerCondition: 'No trigger condition',
    noScheduleConfig: 'No schedule configuration',
    noAction: 'No execution action',
    noDetail: 'No task log details',
    success: 'Success',
    failure: 'Failure',
    taskTypeCondition: 'Condition Task',
    taskTypeScheduled: 'Scheduled Task',
    scheduleOnce: 'Once',
    schedulePeriodic: 'Periodic',
    scheduleInterval: 'Interval',
    scheduleByPlan: 'By Schedule',
    scheduleCalendar: 'Calendar',
    sunday: 'Sun',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    repeatDaily: 'Daily',
    repeatCustom: 'Custom',
    intervalSecond: 'seconds',
    intervalMinute: 'minutes',
    intervalHour: 'hours'
  },
  taskList: {
    title: 'Task List',
    taskName: 'Task Name',
    taskNamePlaceholder: 'Please enter a task name',
    taskType: 'Task Type',
    targetDevice: 'Target Device',
    basicInfo: 'Basic Information',
    scheduleConfig: 'Schedule Configuration',
    noTriggerCondition: 'No trigger condition',
    noScheduleConfig: 'No schedule configuration',
    noAction: 'No execution action',
    noDetail: 'No task details',
    deviceSource: 'Device Source',
    dataType: 'Data Type',
    executionValue: 'Execution Value',
    outOfRangeValue: 'Out-of-range Value',
    conditionRelation: 'Condition Relation',
    scheduleType: 'Schedule Type',
    repeatMethod: 'Repeat Method',
    dateGroup: 'Date Group',
    intervalTime: 'Interval',
    executionDate: 'Execution Date',
    executionTime: 'Execution Time',
    delaySeconds: 'Delay Seconds',
    continuousTimes: 'Consecutive Times',
    executeAction: 'Execution Action',
    status: 'Status',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    remark: 'Remark',
    view: 'View',
    execute: 'Execute',
    executePrompt: 'Execute this task?',
    executeSuccess: 'Executed successfully',
    detail: 'Task Details',
    add: 'Add Task',
    edit: 'Edit Task',
    taskTypePlaceholder: 'Please select a task type',
    statusPlaceholder: 'Please select a status',
    enabled: 'Enabled',
    disabled: 'Disabled',
    descriptionPlaceholder: 'Please enter a remark',
    scheduleSettings: 'Schedule Settings',
    executionTimePlaceholder: 'Please select an execution time',
    executionWeekday: 'Execution Weekday',
    executionTimeNode: 'Execution Time Node',
    addTimeNode: 'Add Time Node',
    deleteTimeNode: 'Delete Time Node',
    intervalTimePlaceholder: 'Please enter an interval',
    timeUnit: 'Time Unit',
    addDateGroup: 'Add Date Group',
    deleteDateGroup: 'Delete Date Group',
    pollingInterval: 'Polling Interval',
    pollingIntervalPlaceholder: 'Please enter a polling interval',
    seconds: 'seconds',
    times: 'times',
    all: 'Select All',
    clear: 'Clear',
    previousYear: 'Previous Year',
    nextYear: 'Next Year',
    year: '{value}',
    month: '{value}',
    selectedDays: '{value} days selected',
    executionDatePlaceholder: 'Please select an execution date',
    activeTimeRange: 'Active Time Range',
    editTimeRange: 'Edit Time Range',
    startTime: 'Start Time',
    endTime: 'End Time',
    alignTimeHint: 'Time is aligned to 5-minute intervals',
    adjustStartTime: 'Adjust start time',
    adjustEndTime: 'Adjust end time',
    deleteTimeRange: 'Delete time range',
    notSelected: 'Not selected',
    triggerCondition: 'Trigger Condition',
    addCondition: 'Add Condition',
    conditionItem: 'Condition {value}',
    deleteCondition: 'Delete Condition',
    relationPlaceholder: 'Please select a relation',
    pointThreshold: 'Point Threshold Settings',
    addThreshold: 'Add Threshold',
    pointPlaceholder: 'Please select a point',
    thresholdPlaceholder: 'Please select a threshold',
    deletePoint: 'Delete Point',
    triggerFrequency: 'Trigger Frequency',
    duration: 'Duration',
    repeatCount: 'Repeat Count',
    addAction: 'Add Action',
    actionItem: 'Action {value}',
    deleteAction: 'Delete Action',
    executeDevice: 'Execution Device',
    executePointSettings: 'Execution Point Settings',
    addPoint: 'Add Point',
    deviceType: 'Device Type',
    deviceTypePlaceholder: 'Please select a device type',
    devicePlaceholder: 'Please select a device',
    pointValuePlaceholder: 'Please enter a number',
    textValuePlaceholder: 'Please enter text',
    enumValuePlaceholder: 'Please select an enum value',
    minValue: 'Minimum',
    maxValue: 'Maximum',
    between: 'to',
    calendarAction: 'Calendar Action',
    addDevice: 'Add Device',
    deviceItem: 'Device {value}',
    inside: 'In Range',
    outside: 'Out of Range',
    selectPoint: 'Please select a point',
    maxConditions: 'At most {value} conditions can be added',
    maxConditionPoints: 'At most {value} point conditions per item',
    maxActions: 'At most {value} actions can be added',
    maxActionPoints: 'At most {value} execution points per item',
    selectDevice: 'Please select the trigger device for condition {condition}',
    selectActionDevice: 'Please select the device for action {value}',
    duplicatePoint: 'Execution device {value} has duplicate points',
    pointRangeMismatch: 'In-range and out-of-range points for execution device {value} must match',
    selectActionPoint: 'Please select point {point} for action {action}',
    missingDataType: 'Data type is missing for {prefix} {item}, point {point}',
    unsupportedThreshold: 'Threshold is not supported for the data type of {prefix} {item}, point {point}',
    invalidRange: 'Minimum must be less than maximum for {prefix} {item}, point {point}',
    inputValue: 'Please enter a value for {prefix} {item}, point {point}',
    invalidDelay: 'Delay seconds for action {value} must be between 1 and 300',
    invalidContinuousTimes: 'Consecutive times for action {value} must be between 1 and 5',
    selectExecutionTime: 'Please select an execution time',
    futureExecutionTime: 'The one-time execution must be later than now',
    selectWeekday: 'Please select at least one weekday',
    positiveIntegerInterval: 'The interval must be a positive integer',
    selectExecutionDate: 'Please select at least one execution date',
    selectDateGroupDate: 'Please select execution dates for date group {value}',
    addDateGroupValidation: 'Please add at least one date group',
    completeDateGroupTime: 'Please add at least one time range to date group {value}',
    validDateGroupTime: 'Please complete time range {range} in date group {group}',
    invalidDateGroupTime: 'Start time must be earlier than end time for date group {group}, range {range}',
    selectExecutionNode: 'Please select at least one execution time',
    completeExecutionNode: 'Please complete all execution time nodes',
    open: 'On',
    close: 'Off',
    to: 'to',
    valuePlaceholder: 'Please enter a number',
    switchValuePlaceholder: 'Please select a switch value',
    conditionAnd: 'And',
    conditionRelationOr: 'Or',
    conditionOnlyOr: 'Condition {value} can only use the Or relation',
    selectConditionPoint: 'Please select point {point} for condition {condition}',
    conditionLabel: 'Condition',
    actionLabel: 'Action',
    greaterThan: 'Greater than',
    lessThan: 'Less than',
    greaterOrEqual: 'At least',
    lessOrEqual: 'At most',
    notBetween: 'Not between',
    equal: 'Equal to',
    notEqual: 'Not equal to',
    minutes: 'min',
    hours: 'hr',
    addCalendarDeviceValidation: 'Please add at least one execution device',
    selectCalendarDevice: 'Please select the device for execution device {value}',
    selectCalendarPoint: 'Please select a point for execution device {value}',
    duplicateCalendarPoint: 'Execution device {value} has duplicate points',
    calendarPointRangeMismatch: 'Points for execution device {value} must match in and out of range',
    selectCalendarPointDetail: 'Please select point {point} for execution device {action}',
    inputCalendarInsideValue: 'Please enter the in-range value for execution device {value}',
    inputCalendarOutsideValue: 'Please enter the out-of-range value for execution device {value}'
  },
  visualSysScreen: {
    title: 'Visual Screens',
    screenTitle: 'Screen Title',
    systemName: 'System Name',
    cover: 'Cover',
    status: 'Status',
    createdAt: 'Created At',
    tagManagement: 'Tag Management',
    edit: 'Edit Screen',
    name: 'Screen Name',
    namePlaceholder: 'Please enter a screen name',
    titlePlaceholder: 'Please enter a screen title'
  },
  common: {
    rootDirectory: 'Root Directory',
    action: 'Action',
    add: 'Add',
    addSuccess: 'Add Success',
    backToHome: 'Back to home',
    batchDelete: 'Batch Delete',
    import: 'Import',
    export: 'Export',
    importSuccess: 'Import Success',
    importFail: 'Import Fail',
    importTemplate: 'Import Template',
    importResult: 'Import Result',
    downloadTemplate: 'Download Template',
    importEnd: '',
    importFormat: 'and the format is',
    importTip: 'Please upload a file no larger than',
    importSize: 'Please upload a file no larger than',
    exportSuccess: 'Export Success',
    exportFail: 'Export Fail',
    updateExisting: 'Whether to update the existing user data',
    cancel: 'Cancel',
    close: 'Close',
    check: 'Check',
    selectAll: 'Select All',
    expandColumn: 'Expand Column',
    columnSetting: 'Column Setting',
    config: 'Config',
    login: 'Login',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    deleteSuccess: 'Delete Success',
    confirmDelete: 'Are you sure you want to delete?',
    edit: 'Edit',
    download: 'Download',
    warning: 'Warning',
    error: 'Error',
    index: 'Index',
    keywordSearch: 'Please enter keyword',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    lookForward: 'Coming soon',
    modify: 'Modify',
    modifySuccess: 'Modify Success',
    noData: 'No Data',
    unknown: 'Unknown',
    operate: 'Operate',
    pleaseCheckValue: 'Please check whether the value is valid',
    refresh: 'Refresh',
    reset: 'Reset',
    search: 'Search',
    switch: 'Switch',
    tip: 'Tip',
    trigger: 'Trigger',
    update: 'Update',
    saveSuccess: 'Save Success',
    updateSuccess: 'Update Success',
    noChange: 'No actions were taken',
    userCenter: 'User Center',
    yesOrNo: {
      yes: 'Yes',
      no: 'No'
    },
    second: 'Second',
    selected: 'selected',
    anyRecords: 'records',
    clear: 'Clear',
    noSelectRecord: 'No Records Selected'
  },
  request: {
    logout: 'Logout user after request failed',
    logoutMsg: 'User status is invalid, please log in again',
    logoutWithModal: 'Pop up modal after request failed and then log out user',
    logoutWithModalMsg: 'User status is invalid, please log in again',
    refreshToken: 'The requested token has expired, refresh the token',
    tokenExpired: 'The requested token has expired'
  },
  theme: {
    themeDrawerTitle: 'Theme Configuration',
    tabs: {
      appearance: 'Appearance',
      layout: 'Layout',
      general: 'General',
      preset: 'Preset'
    },
    appearance: {
      themeSchema: {
        title: 'Theme Schema',
        light: 'Light',
        dark: 'Dark',
        auto: 'Follow System'
      },
      grayscale: 'Grayscale',
      colourWeakness: 'Colour Weakness',
      themeColor: {
        title: 'Theme Color',
        primary: 'Primary',
        info: 'Info',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        followPrimary: 'Follow Primary'
      },
      themeRadius: {
        title: 'Theme Radius'
      },
      recommendColor: 'Apply Recommended Color Algorithm',
      recommendColorDesc: 'The recommended color algorithm refers to',
      preset: {
        title: 'Theme Presets',
        apply: 'Apply',
        applySuccess: 'Preset applied successfully',
        default: {
          name: 'Default Preset',
          desc: 'Default theme preset with balanced settings'
        },
        soybean: {
          name: 'Soybean',
          desc: 'Default theme preset of SoybeanAdmin'
        },
        dark: {
          name: 'Dark Preset',
          desc: 'Dark theme preset for night time usage'
        },
        compact: {
          name: 'Compact Preset',
          desc: 'Compact layout preset for small screens'
        },
        azir: {
          name: "Azir's Preset",
          desc: 'It is a cold and elegant preset that Azir likes'
        }
      }
    },
    layout: {
      layoutMode: {
        title: 'Layout Mode',
        vertical: 'Vertical Mode',
        horizontal: 'Horizontal Mode',
        'vertical-mix': 'Vertical Mix Mode',
        'vertical-hybrid-header-first': 'Left Hybrid Header-First',
        'top-hybrid-sidebar-first': 'Top-Hybrid Sidebar-First',
        'top-hybrid-header-first': 'Top-Hybrid Header-First',
        vertical_detail: 'Vertical menu layout, with the menu on the left and content on the right.',
        'vertical-mix_detail':
          'Vertical mix-menu layout, with the primary menu on the dark left side and the secondary menu on the lighter left side.',
        'vertical-hybrid-header-first_detail':
          'Left hybrid layout, with the primary menu at the top, the secondary menu on the dark left side, and the tertiary menu on the lighter left side.',
        horizontal_detail: 'Horizontal menu layout, with the menu at the top and content below.',
        'top-hybrid-sidebar-first_detail':
          'Top hybrid layout, with the primary menu on the left and the secondary menu at the top.',
        'top-hybrid-header-first_detail':
          'Top hybrid layout, with the primary menu at the top and the secondary menu on the left.'
      },
      tab: {
        title: 'Tab Settings',
        visible: 'Tab Visible',
        cache: 'Tag Bar Info Cache',
        cacheTip: 'Keep the tab bar information after leaving the page',
        height: 'Tab Height',
        mode: {
          title: 'Tab Mode',
          slider: 'Slider',
          chrome: 'Chrome',
          button: 'Button'
        },
        closeByMiddleClick: 'Close Tab by Middle Click',
        closeByMiddleClickTip: 'Enable closing tabs by clicking with the middle mouse button'
      },
      header: {
        title: 'Header Settings',
        height: 'Header Height',
        breadcrumb: {
          visible: 'Breadcrumb Visible',
          showIcon: 'Breadcrumb Icon Visible'
        }
      },
      sider: {
        title: 'Sider Settings',
        inverted: 'Dark Sider',
        width: 'Sider Width',
        collapsedWidth: 'Sider Collapsed Width',
        mixWidth: 'Mix Sider Width',
        mixCollapsedWidth: 'Mix Sider Collapse Width',
        mixChildMenuWidth: 'Mix Child Menu Width',
        autoSelectFirstMenu: 'Auto Select First Submenu',
        autoSelectFirstMenuTip:
          'When a first-level menu is clicked, the first submenu is automatically selected and navigated to the deepest level'
      },
      footer: {
        title: 'Footer Settings',
        visible: 'Footer Visible',
        fixed: 'Fixed Footer',
        height: 'Footer Height',
        right: 'Right Footer'
      },
      content: {
        title: 'Content Area Settings',
        scrollMode: {
          title: 'Scroll Mode',
          tip: 'The theme scroll only scrolls the main part, the outer scroll can carry the header and footer together',
          wrapper: 'Wrapper',
          content: 'Content'
        },
        page: {
          animate: 'Page Animate',
          mode: {
            title: 'Page Animate Mode',
            fade: 'Fade',
            'fade-slide': 'Slide',
            'fade-bottom': 'Fade Zoom',
            'fade-scale': 'Fade Scale',
            'zoom-fade': 'Zoom Fade',
            'zoom-out': 'Zoom Out',
            none: 'None'
          }
        },
        fixedHeaderAndTab: 'Fixed Header And Tab'
      }
    },
    general: {
      title: 'General Settings',
      watermark: {
        title: 'Watermark Settings',
        visible: 'Watermark Full Screen Visible',
        text: 'Custom Watermark Text',
        enableUserName: 'Enable User Name Watermark',
        enableTime: 'Show Current Time',
        timeFormat: 'Time Format'
      },
      multilingual: {
        title: 'Multilingual Settings',
        visible: 'Display multilingual button'
      },
      globalSearch: {
        title: 'Global Search Settings',
        visible: 'Display GlobalSearch button'
      }
    },
    configOperation: {
      copyConfig: 'Copy Config',
      copySuccessMsg: 'Copy Success, Please replace the variable "themeSettings" in "src/theme/settings.ts"',
      resetConfig: 'Reset Config',
      resetSuccessMsg: 'Reset Success'
    },
    tablePropsTitle: 'Table Props',
    table: {
      size: {
        title: 'Table Size',
        small: 'Small',
        medium: 'Medium',
        large: 'Large'
      },
      bordered: 'Bordered',
      bottomBordered: 'Bottom Bordered',
      singleColumn: 'Single Column',
      singleLine: 'Single Line',
      striped: 'Striped'
    }
  },
  route: {
    // 公共基础路由
    login: 'Login',
    403: 'No Permission',
    404: 'Page Not Found',
    500: 'Server Error',
    'iframe-page': 'Iframe',
    home: 'Home',
    // 运营平台菜单
    datahub: 'Data Hub',
    datahub_rule: 'Rule Management',
    menu: 'Menu Management',
    menu_platform: 'Operation Menu Management',
    'menu_platform-menu': 'Operation Menu Management',
    menu_platform_add: 'Add Operation Menu',
    menu_platform_edit: 'Edit Operation Menu',
    menu_platform_delete: 'Delete Operation Menu',
    menu_corp: 'Integrator Menu Management',
    'menu_corp-menu': 'Integrator Menu Management',
    menu_corp_add: 'Add Integrator Menu',
    menu_corp_edit: 'Edit Integrator Menu',
    menu_corp_delete: 'Delete Integrator Menu',
    menu_project: 'Project Menu Management',
    'menu_project-menu': 'Project Menu Management',
    menu_project_add: 'Add Project Menu',
    menu_project_edit: 'Edit Project Menu',
    menu_project_delete: 'Delete Project Menu',
    global: 'Global Configuration',
    global_industry: 'Industry Type Management',
    global_industry_add: 'Add Industry Type',
    global_industry_edit: 'Edit Industry Type',
    global_industry_delete: 'Delete Industry Type',
    global_screen: 'System Screen Management',
    'global_sys-screen': 'System Screen Management',
    global_sys_screen_add: 'Add System Screen',
    global_sys_screen_edit: 'Edit System Screen',
    global_sys_screen_delete: 'Delete System Screen',
    global_activate: 'Activation Code',
    global_type_template: 'Device Type Template Management',
    'global_device-type-template': 'Device Type Template Management',
    global_type_template_detail: 'Device Type Template Points Management',
    'global_device-type-template-point': 'Device Type Template Points Management',
    global_device_type_template_category_add: 'Add Device Type Template Category',
    global_device_type_template_category_edit: 'Edit Device Type Template Category',
    global_device_type_template_category_delete: 'Delete Device Type Template Category',
    global_device_type_template_add: 'Add Device Type Template',
    global_device_type_template_edit: 'Edit Device Type Template',
    global_device_type_template_delete: 'Delete Device Type Template',
    global_device_type_template_point_view: 'View Device Type Template Point',
    global_device_type_template_point_add: 'Add Device Type Template Point',
    global_device_type_template_point_edit: 'Edit Device Type Template Point',
    global_device_type_template_point_delete: 'Delete Device Type Template Point',
    corp: 'Integrator Management',
    corp_management: 'Integrator Management',
    'corp_corp-list': 'Integrator Management',
    corp_corp_list_add: 'Add Integrator',
    corp_corp_list_status: 'Change Integrator Status',
    corp_corp_list_delete: 'Delete Integrator',
    corp_corp_list_view: 'View Integrator Detail',
    corp_detail: 'Integrator Detail Management',
    'corp_corp-detail': 'Integrator Detail Management',
    corp_version: 'Version Management',
    corp_version_add: 'Add Version',
    corp_version_edit: 'Edit Version',
    corp_version_delete: 'Delete Version',

    // 集成商平台菜单
    version: 'Version Configuration',
    version_management: 'Version Management',
    project: 'Project Configuration',
    project_management: 'Project Management',
    project_project_list_add: 'Add Project',
    project_project_list_view: 'View Project',
    project_project_list_delete: 'Delete Project',
    project_detail: 'Project Detail',

    // 其它业务菜单
    device_configuration: 'Device Configuration',
    device_group_management: 'Device Group Management',
    device_type_management: 'Device Type Management',
    device_type_detail: 'Device Type Detail',
    device_management: 'Device Management',
    device_detail: 'Device Detail',
    device_point_management: 'Device Point Management',
    physical_point_detail: 'Physical Point Detail',
    virtual_point: 'Virtual Point',
    ledger_configuration: 'Ledger Configuration',
    assets_management: 'Assets Management',
    assets_type_management: 'Asset Type Management',
    effroom: 'Efficiency Room',
    effroom_overview: 'Efficiency Overview',
    point_compare: 'Point Compare',
    energy_calendar: 'Energy Calendar',
    rule_configuration: 'Rule Configuration',
    message_rule_management: 'Message Rule Management',
    task_configuration: 'Task Configuration',
    task_management: 'Task Management',
    task_log: 'Task Log',
    space_configuration: 'Space Configuration',
    space_type_management: 'Space Type Management',
    space_management: 'Space Management',
    alarm_configuration: 'Alarm Configuration',
    notice_group_management: 'Notice Group Management',
    alarm_rule_management: 'Alarm Rule Management',
    alarm_record_management: 'Alarm Record Management',
    producer: 'Monitor Producer',
    monitor_device: 'Monitor Device',
    player: 'Video Player',
    workorder_configuration: 'Work Order Configuration',
    workorder_management: 'Work Order Management',
    energy: 'Energy Management',
    energy_list: 'Energy List',
    energy_runtime: 'Runtime',
    visual_configuration: 'Visual Configuration',
    configuration_center: 'Configuration Center',
    sys_screen_management: 'System Screen Management',
    sys_screen_tag: 'Screen Tag',
    fuxa_management: 'FUXA Management',
    ioc_management: 'IOC Management',
    toolbox_management: 'Toolbox Management',

    // 多平台公共菜单
    system_configuration: 'System Configuration',
    user_management: 'User Management',
    dept_management: 'Dept Management',
    role_management: 'Role Management',
    log_management: 'Log Management',
    personal_configuration: 'Personal Configuration',
    user_center: 'User Center',
    system: 'System Management',
    system_user: 'User Management',
    system_user_add: 'Add User',
    system_user_edit: 'Edit User',
    system_user_delete: 'Delete User',
    system_user_password_reset: 'Reset User Password',
    system_industry: 'Industry Management',
    system_role: 'Role Management',
    system_role_add: 'Add Role',
    system_role_edit: 'Edit Role',
    system_role_delete: 'Delete Role',
    system_role_assign: 'Assign Role Permissions',
    system_menu: 'Menu Management',
    system_dept: 'Dept Management',
    system_dept_add: 'Add Dept',
    system_dept_edit: 'Edit Dept',
    system_dept_delete: 'Delete Dept',
    system_post: 'Post Management',
    system_dict: 'Dict Management',
    system_config: 'Config Management',
    system_notice: 'Notice Management',
    system_oss: 'File Management',
    'system_oss-config': 'OSS Config',
    system_toolbox: 'Toolbox Management',
    system_client: 'Client Management',
    system_tenant: 'Tenant Management',
    'system_tenant-package': 'Tenant Package Management',

    // 其它存量菜单
    monitor: 'Video Monitor',
    monitor_logininfor: 'Login Log',
    monitor_operlog: 'Operate Log',
    monitor_cache: 'Cache Monitor',
    monitor_online: 'Online User',

    // 公共内置路由
    'user-center': 'User Center',
    'social-callback': 'Social Callback',
    demo: 'Demo',
    demo_demo: 'Demo Table',
    demo_tree: 'Demo Tree',
    exception: 'Exception',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500',
    tool: 'System Tools',
    tool_gen: 'Code Generation',
    about: 'About'
  },
  dict: {
    sys_user_sex: {
      male: 'Male',
      female: 'Female',
      unknown: 'Unknown'
    },
    sys_show_hide: {
      show: 'Show',
      hide: 'Hide'
    },
    sys_normal_disable: {
      normal: 'Normal',
      disable: 'Disable'
    },
    sys_yes_no: {
      yes: 'Yes',
      no: 'No'
    },
    sys_notice_type: {
      notice: 'Notice',
      announcement: 'Announcement'
    },
    sys_notice_status: {
      normal: 'Normal',
      close: 'Close'
    },
    sys_oper_type: {
      insert: 'Insert',
      update: 'Update',
      delete: 'Delete',
      grant: 'Grant',
      export: 'Export',
      import: 'Import',
      force: 'Force',
      gencode: 'Generate Code',
      clean: 'Clean Data',
      other: 'Other'
    },
    sys_common_status: {
      success: 'Success',
      fail: 'Fail'
    },
    sys_grant_type: {
      password: 'Password Auth',
      sms: 'SMS Auth',
      email: 'Email Auth',
      miniapp: 'Mini App Auth',
      social: 'Social Auth'
    },
    sys_device_type: {
      pc: 'PC',
      android: 'Android',
      ios: 'iOS',
      miniapp: 'Mini App'
    },
    data_type: {
      number: 'Number',
      switch: 'Switch',
      text: 'Text',
      enum: 'Enum'
    },
    access_level: {
      readOnly: 'Read Only',
      writeOnly: 'Write Only',
      readWrite: 'Read/Write'
    },
    wf_business_status: {
      revoked: 'Revoked',
      draft: 'Draft',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
      returned: 'Returned',
      terminated: 'Terminated'
    },
    wf_form_type: {
      custom_form: 'Custom Form',
      dynamic_form: 'Dynamic Form'
    },
    wf_task_status: {
      revoke: 'Revoke',
      pass: 'Pass',
      pending_review: 'Pending Review',
      cancel: 'Cancel',
      return: 'Return',
      terminate: 'Terminate',
      transfer: 'Transfer',
      delegate: 'Delegate',
      copy: 'Copy',
      add_sign: 'Add Sign',
      minus_sign: 'Minus Sign',
      timeout: 'Timeout'
    }
  },
  page: {
    login: {
      common: {
        title: 'Chongshi Technology, your AI energy-saving digital partner',
        subTitle: 'Provides a complete enterprise management solution for customers',
        loginOrRegister: 'Login / Register',
        register: 'Register',
        userNamePlaceholder: 'Please enter user name',
        phonePlaceholder: 'Please enter phone number',
        codePlaceholder: 'Please enter verification code',
        passwordPlaceholder: 'Please enter password',
        confirmPasswordPlaceholder: 'Please enter password again',
        sendCodeDesc: 'Enter your phone number and we will send a verification code to your phone',
        codeLogin: 'Verification code login',
        confirm: 'Confirm',
        back: 'Back',
        submit: 'Submit',
        validateSuccess: 'Verification passed',
        loginSuccess: 'Login successfully',
        welcomeBack: 'Welcome back, {userName} !',
        retryAfter: 'Retry after {time}s',
        noCaptcha: 'No captcha',
        noAccount: 'No account yet?',
        applyCorpEntry: 'Integrator Entry'
      },
      pwdLogin: {
        title: 'Password Login',
        accountTitle: 'Log in to your account',
        accountSubtitle: 'Welcome back! Please enter your account information',
        rememberMe: 'Remember password',
        forgetPassword: 'Forget password?',
        register: 'Register',
        otherLoginMode: 'Other Login Mode',
        selectCorpTitle: 'Select Integrator',
        selectCorpSubtitle: 'Please select the integrator for this login',
        searchCorpPlaceholder: 'Search integrator or username',
        emptyCorp: 'No matching integrators',
        selectProjectTitle: 'Select Project',
        selectProjectSubtitle: 'Please select the project for this login',
        searchProjectPlaceholder: 'Search projects',
        emptyProject: 'No matching projects',
        projectId: 'Project ID: {id}',
        superAdmin: 'Super Admin',
        admin: 'Admin',
        user: 'User'
      },
      codeLogin: {
        title: 'Verification Code Login',
        getCode: 'Get code',
        reGetCode: 'Reacquire after {time}s',
        sendCodeSuccess: 'Verification code sent successfully',
        imageCodePlaceholder: 'Please enter image verification code'
      },
      register: {
        title: 'Project Member Registration',
        subTitle: 'Enter project and account information to complete registration',
        query: 'Query',
        agreement: 'I have read and agree to',
        protocol: '《User Agreement》',
        policy: '《Privacy Policy》',
        projectChecked: 'Project verification passed',
        projectNotFound: 'Project does not exist',
        projectNamePlaceholder: 'Please enter Project Name',
        userNamePlaceholder: 'Please enter username',
        phoneExists: 'Phone number already exists and the existing account will be used',
        registerSuccess: 'Registration successful',
        form: {
          projectName: {
            required: 'Project Name cannot be empty',
            invalid: 'Project Name cannot be empty'
          },
          userName: {
            required: 'Username cannot be empty',
            invalid: 'Username cannot be empty'
          }
        }
      },
      resetPwd: {
        title: 'Reset Password',
        resetSuccess: 'Password reset successfully. Please log in again',
        codePattern: 'Please enter a 4-digit verification code'
      },
      applyCorp: {
        title: 'Integrator Entry',
        subTitle: 'Enter the entry information and we will complete the review as soon as possible',
        submitSuccess: 'Submitted successfully',
        nameMax: 'Integrator Name cannot exceed 20 characters',
        addressMax: 'Detailed Address cannot exceed 30 characters',
        phoneExists: 'Phone already exists and the existing account will be used',
        form: {
          name: {
            required: 'Integrator Name cannot be empty',
            invalid: 'Integrator Name cannot be empty'
          },
          region: {
            required: 'Location cannot be empty',
            invalid: 'Location cannot be empty'
          },
          address: {
            required: 'Detailed Address cannot be empty',
            invalid: 'Detailed Address cannot be empty'
          },
          contactName: {
            required: 'Contact Name cannot be empty',
            invalid: 'Contact Name cannot be empty'
          },
          contactPhone: {
            required: 'Phone cannot be empty',
            invalid: 'Phone cannot be empty'
          },
          password: {
            required: 'Login Password cannot be empty',
            invalid: 'Login Password cannot be empty'
          }
        },
        placeholder: {
          name: 'Please enter Integrator Name',
          region: 'Please select Location (required)',
          address: 'Please enter Detailed Address',
          contactName: 'Please enter Contact Name',
          contactPhone: 'Please enter Phone',
          password: 'The login password will not be displayed. Please keep it safe',
          confirmPassword: 'The login password will not be displayed. Please keep it safe',
          email: 'Please enter Email (optional)'
        }
      },
      selectList: {
        ariaEnter: 'Enter {name}',
        backLogin: 'Back to Login'
      },
      bindWeChat: {
        title: 'Bind WeChat'
      }
    },
    home: {
      branchDesc:
        'For the convenience of everyone in developing and updating the merge, we have streamlined the code of the main branch, only retaining the homepage menu, and the rest of the content has been moved to the example branch for maintenance. The preview address displays the content of the example branch.',
      greeting: '{userName}, today is another day full of vitality!',
      weatherDesc: 'Today is cloudy to clear, 20℃ - 25℃!',
      projectCount: 'Project Count',
      todo: 'Todo',
      message: 'Message',
      areaCount: 'Area Count',
      registerCount: 'Register Count',
      schedule: 'Work and rest Schedule',
      study: 'Study',
      work: 'Work',
      rest: 'Rest',
      entertainment: 'Entertainment',
      integratorCount: 'Integrator Count',
      userCount: 'User Count',
      dealCount: 'Deal Count',
      projectNews: {
        title: 'Project News',
        moreNews: 'More News',
        desc1: 'Soybean created the open source project soybean-admin on May 28, 2021!',
        desc2: 'Yanbowe submitted a bug to soybean-admin, the multi-tab bar will not adapt.',
        desc3: 'Soybean is ready to do sufficient preparation for the release of soybean-admin!',
        desc4: 'Soybean is busy writing project documentation for soybean-admin!',
        desc5: 'Soybean just wrote some of the workbench pages casually, and it was enough to see!'
      },
      creativity: 'Creativity'
    },
    userCenter: {
      personalInfo: 'Personal Info',
      basicInfo: 'Basic Info',
      updatePassword: 'Change Password',
      projectLogo: 'Project Logo',
      username: 'Username',
      phoneNumber: 'Phone Number',
      dept: 'Department',
      role: 'Role',
      email: 'Email',
      gender: 'Gender',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      editAvatar: 'Edit Avatar',
      editProjectLogo: 'Edit Project Logo',
      selectImage: 'Select Image',
      confirmCrop: 'Confirm Crop',
      form: {
        username: {
          required: 'Username cannot be empty',
          invalid: 'Username cannot be empty'
        },
        role: {
          required: 'Role cannot be empty',
          invalid: 'Role cannot be empty'
        },
        oldPassword: {
          required: 'Old Password cannot be empty',
          invalid: 'Old Password cannot be empty'
        },
        newPassword: {
          required: 'New Password cannot be empty',
          invalid: 'New Password cannot be empty'
        },
        confirmPassword: {
          required: 'Confirm Password cannot be empty',
          invalid: 'Confirm Password cannot be empty'
        }
      },
      placeholder: {
        nickname: 'Please enter nickname',
        phone: 'Please enter phone number',
        dept: 'Please select department',
        role: 'Please select role',
        email: 'Please enter email',
        oldPassword: 'Please enter old password',
        newPassword: 'Please enter new password',
        confirmPassword: 'Please enter new password again'
      },
      message: {
        profileUpdateSuccess: 'Updated successfully',
        passwordMismatch: 'The two passwords are inconsistent',
        passwordUpdateSuccess: 'Password changed successfully',
        imageTypeRequired: 'Please upload an image file (JPG, PNG, etc.)',
        avatarUpdateSuccess: 'Avatar updated successfully!',
        projectLogoUpdateSuccess: 'Project logo updated successfully!'
      }
    },
    common: {
      id: 'ID',
      createBy: 'Creator',
      createTime: 'Create Time',
      updateBy: 'Updater',
      updateTime: 'Update Time',
      remark: 'Remark',
      form: {
        remark: {
          required: 'Please enter remark',
          invalid: 'Remark cannot be empty'
        }
      },
      pointForm: {
        name: 'Name',
        key: 'Identifier',
        dataType: 'Data Type',
        unit: 'Unit',
        defaultValue: 'Default Value',
        scale: 'Precision',
        energyType: 'Energy Type',
        sourceDataType: 'Source Data Type',
        enumSourceDataType: 'Enum Source Data Type',
        enumMapping: 'Enum Mapping',
        pointDesc: 'Point Description',
        enumValue: 'Value',
        mappingName: 'Mapping Name',
        mappingLabel: '{value} Mapping',
        form: {
          name: {
            required: 'Please enter Point Name',
            invalid: 'Point Name cannot be empty'
          },
          key: {
            required: 'Please enter Identifier',
            invalid: 'Identifier cannot be empty'
          },
          dataType: {
            required: 'Please select Data Type',
            invalid: 'Data Type cannot be empty'
          },
          unit: {
            required: 'Please select or enter Unit (e.g. kWh, J, dB)',
            invalid: 'Unit cannot be empty'
          },
          defaultValue: {
            required: 'Please enter Default Value',
            invalid: 'Default Value cannot be empty'
          },
          scale: {
            required: 'Please select Precision',
            invalid: 'Precision cannot be empty'
          },
          energyType: {
            required: 'Please select Energy Type',
            invalid: 'Energy Type cannot be empty'
          },
          sourceDataType: {
            required: 'Please select Source Data Type',
            invalid: 'Source Data Type cannot be empty'
          },
          mappingValue: {
            required: 'Please enter Mapping Value',
            invalid: 'Mapping Value cannot be empty'
          },
          mappingName: {
            required: 'Please enter Mapping Name',
            invalid: 'Mapping Name cannot be empty'
          },
          enumSourceDataType: {
            required: 'Please select Enum Source Data Type',
            invalid: 'Enum Source Data Type cannot be empty'
          },
          pointDesc: {
            required: 'Please enter Point Description',
            invalid: 'Point Description cannot be empty'
          }
        },
        options: {
          unitGroups: {
            temperature: 'Temperature',
            humidity: 'Humidity',
            pressure: 'Pressure',
            electrical: 'Electrical - Voltage/Current',
            powerEnergy: 'Electrical - Power/Energy',
            resistance: 'Electrical - Resistance/Power Factor',
            flow: 'Flow',
            volume: 'Volume',
            length: 'Length',
            velocity: 'Velocity',
            frequency: 'Frequency',
            time: 'Time',
            mass: 'Mass',
            light: 'Light',
            concentration: 'Concentration / Air Quality',
            energy: 'Energy',
            acousticsWater: 'Acoustics / Water Quality',
            general: 'General'
          },
          units: {
            celsius: 'Celsius',
            fahrenheit: 'Fahrenheit',
            kelvin: 'Kelvin',
            relativeHumidity: 'Relative Humidity',
            humidityRatio: 'Grams of Water per Kilogram of Dry Air',
            pascal: 'Pascal',
            kilopascal: 'Kilopascal',
            bar: 'Bar',
            hectopascal: 'Hectopascal',
            millibar: 'Millibar',
            psi: 'Pound-force per Square Inch',
            inchWater: 'Inch of Water',
            millimeterMercury: 'Millimeter of Mercury',
            unit0: 'Volt',
            unit1: 'Millivolt',
            unit2: 'Kilovolt',
            unit3: 'Ampere',
            unit4: 'Milliampere',
            unit5: 'Watt',
            unit6: 'Milliwatt',
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
          enumSourceNumber: 'Number',
          enumSourceString: 'String',
          precisionNone: 'No Decimal Places',
          precision1: 'Keep 1 Decimal Place',
          precision2: 'Keep 2 Decimal Places',
          precision3: 'Keep 3 Decimal Places',
          energyNone: 'None',
          energyElectricity: 'Electricity',
          energyWater: 'Water',
          energyGas: 'Gas',
          energyCooling: 'Cooling',
          energyHeating: 'Heating',
          energyRuntime: 'Runtime'
        },
        message: {
          enumMappingRequired: 'Please configure at least one enum mapping'
        }
      }
    },
    corp: {
      common: {
        name: 'Integrator Name',
        address: 'Integrator Address',
        region: 'Region',
        location: 'Location',
        detailAddress: 'Detailed Address',
        contact: 'Contact',
        contactPhone: 'Phone',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        status: 'Status',
        useStatus: 'Use Status',
        auditStatus: 'Audit Status',
        view: 'View',
        audit: 'Audit',
        pass: 'Pass',
        reject: 'Reject',
        back: 'Back',
        enable: 'Enable',
        disable: 'Disable',
        auditing: 'Auditing',
        approved: 'Approved',
        rejected: 'Rejected',
        addCorp: 'Add Integrator',
        form: {
          name: {
            required: 'Please enter Integrator Name',
            invalid: 'Integrator Name cannot be empty'
          },
          region: {
            required: 'Please select Region',
            invalid: 'Region cannot be empty'
          },
          detailAddress: {
            required: 'Please enter Detailed Address',
            invalid: 'Detailed Address cannot be empty'
          },
          contact: {
            required: 'Please enter Contact',
            invalid: 'Contact cannot be empty'
          },
          contactPhone: {
            required: 'Please enter Phone',
            invalid: 'Phone cannot be empty'
          },
          password: {
            required: 'Please enter Password',
            invalid: 'Password cannot be empty'
          }
        },
        placeholder: {
          companyName: 'Please enter Company Name',
          email: 'Please enter Email',
          password: 'The login password will not be displayed. Please keep it safe or reset it if forgotten.'
        },
        message: {
          nameMax: 'Integrator Name cannot exceed 20 characters',
          addressMax: 'Detailed Address cannot exceed 30 characters',
          confirmStatus: 'Confirm to {action} this integrator?',
          statusUpdateSuccess: 'Status updated successfully',
          auditPassSuccess: 'Audit approved',
          auditRejectSuccess: 'Audit rejected',
          missingCorpId: 'Missing Integrator ID',
          emptyCorpDetail: 'No integrator details'
        }
      },
      list: {
        title: 'Integrator List'
      },
      detail: {
        title: 'Integrator Detail',
        versionData: 'Version Data'
      },
      version: {
        title: 'Version List',
        name: 'Name',
        versionName: 'Version Name',
        versionDesc: 'Version Description',
        corp: 'Integrator',
        using: 'In Use',
        unassigned: 'Unassigned',
        startTime: 'Start Time',
        endTime: 'End Time',
        expectedStartTime: 'Expected Start Time',
        addVersion: 'Add Version',
        editVersion: 'Edit Version',
        addExistingVersion: 'Add Existing Version',
        benefitView: 'Benefit View',
        renewal: 'Renew',
        renewalDuration: 'Please enter renewal duration:',
        priceConfig: 'Price Config',
        priceBenefit: 'Price Benefits',
        originalPrice: 'Original Price',
        discountPrice: 'Discount Price',
        duration: 'Duration',
        resourceConfig: 'Resource Config',
        deviceCount: 'Device Count',
        userCount: 'User Count',
        dailyMessageCount: 'Daily Message Count',
        dataStore: 'Data Retention',
        dataStoreDuration: 'Data Retention Duration',
        menuConfig: 'Menu Config',
        menuPermission: 'Menu Permission',
        benefitSummary: 'Benefit Summary',
        menuBenefit: 'Menu Benefits',
        allBenefit: 'All Benefits',
        day: 'Day',
        month: 'Month',
        year: 'Year',
        calendarDay: 'Day',
        dayDurationUnit: 'days',
        monthDurationUnit: 'months',
        yearDurationUnit: 'years',
        deviceUnit: 'devices',
        userUnit: 'users',
        messageUnit: 'messages',
        countWithUnit: '{count} {unit}',
        dailyMessageBenefit: '{count} daily messages',
        dataStoreBenefit: '{count} {unit} data retention',
        priceDurationBenefit: '{count} {unit} ￥{price}',
        menuId: 'Menu ID: {id}',
        selectedAddVersions: '{count} versions selected to add',
        selectVersion: 'Please select versions to add',
        emptyBenefitSummary: 'No benefit summary',
        emptyMenuBenefit: 'No menu benefits',
        emptyAllBenefit: 'No benefits',
        emptyBenefitData: 'No benefit data',
        legacy: {
          gatewayManagement: 'Edge Device Management',
          energyScreen: 'Energy Screen',
          meterSetting: 'Meter Settings',
          energyPriceManagement: 'Energy Price Management',
          energyCategory: 'Energy Category'
        },
        form: {
          versionName: {
            required: 'Please enter Version Name',
            invalid: 'Version Name cannot be empty'
          },
          versionDesc: {
            required: 'Please enter Version Description',
            invalid: 'Version Description cannot be empty'
          },
          corp: {
            required: 'Please select Integrator',
            invalid: 'Integrator cannot be empty'
          },
          expectedStartTime: {
            required: 'Please select Expected Start Time',
            invalid: 'Expected Start Time cannot be empty'
          },
          originalPrice: {
            required: 'Please enter Original Price',
            invalid: 'Original Price cannot be empty'
          },
          discountPrice: {
            required: 'Please enter Discount Price',
            invalid: 'Discount Price cannot be empty'
          },
          duration: {
            required: 'Please enter Duration',
            invalid: 'Duration cannot be empty'
          },
          deviceCount: {
            required: 'Please enter Device Count',
            invalid: 'Device Count cannot be empty'
          },
          userCount: {
            required: 'Please enter User Count',
            invalid: 'User Count cannot be empty'
          },
          dailyMessageCount: {
            required: 'Please enter Daily Message Count',
            invalid: 'Daily Message Count cannot be empty'
          },
          dataStoreDuration: {
            required: 'Please enter Data Retention Duration',
            invalid: 'Data Retention Duration cannot be empty'
          },
          renewalDuration: {
            required: 'Please enter Renewal Duration',
            invalid: 'Renewal Duration cannot be empty'
          }
        },
        message: {
          versionNameMax: 'Version Name cannot exceed 10 characters',
          selectMenuRequired: 'Please select at least one menu',
          renewalSuccess: 'Renewal successful'
        }
      }
    },
    project: {
      list: {
        title: 'Project List',
        projectName: 'Project Name',
        key: 'Identifier',
        address: 'Project Address',
        leader: 'Leader',
        contactPhone: 'Phone',
        version: 'Version',
        projectVersion: 'Project Version',
        projectStatus: 'Project Status',
        view: 'View',
        member: 'Members',
        memberName: 'Member Name',
        phoneNumber: 'Phone Number',
        addProject: 'Add Project',
        editProject: 'Edit Project',
        versionViewTitle: 'View Project Version',
        memberTitle: 'Project Members',
        memberTitleWithName: 'Project Members: {name}',
        currentVersion: 'Current Version',
        priceTime: 'Price / Time',
        versionMenu: 'Version Menu',
        platformPassword: 'Project Platform Password',
        projectDesc: 'Project Description',
        leaderPhone: 'Leader Phone',
        enabled: 'Enabled',
        disabled: 'Disabled',
        form: {
          projectName: {
            required: 'Project Name cannot be empty',
            invalid: 'Project Name cannot be empty'
          },
          key: {
            required: 'Project Identifier cannot be empty',
            invalid: 'Project Identifier cannot be empty'
          },
          region: {
            required: 'Region cannot be empty',
            invalid: 'Region cannot be empty'
          },
          address: {
            required: 'Detailed Address cannot be empty',
            invalid: 'Detailed Address cannot be empty'
          },
          version: {
            required: 'Project Version cannot be empty',
            invalid: 'Project Version cannot be empty'
          },
          leader: {
            required: 'Leader cannot be empty',
            invalid: 'Leader cannot be empty'
          },
          contactPhone: {
            required: 'Phone cannot be empty',
            invalid: 'Phone cannot be empty'
          },
          platformPassword: {
            required: 'Project Platform Password cannot be empty',
            invalid: 'Project Platform Password cannot be empty'
          }
        },
        placeholder: {
          projectName: 'Please enter Project Name',
          key: 'Please enter Project Identifier',
          region: 'Please select Region',
          address: 'Please enter Detailed Address',
          version: 'Please select Project Version',
          leader: 'Please select Leader',
          leaderPhone: 'Leader Phone',
          password: 'The login password will not be displayed. Please keep it safe or reset it if forgotten.',
          confirmPassword: 'The login password will not be displayed. Please keep it safe or reset it if forgotten.',
          projectDesc: 'Please enter Project Description',
          memberName: 'Please enter Member Name'
        },
        message: {
          projectNameMax: 'Project Name cannot exceed 20 characters',
          projectKeyPattern:
            'Project Identifier must start with a letter and contain only letters, numbers, and underscores',
          addressMax: 'Detailed Address cannot exceed 30 characters',
          existingLeaderPhone: 'Leader phone already exists and the existing account will be used',
          statusUpdateSuccess: 'Status updated successfully',
          unboundVersion: 'Current project is not bound to a version',
          emptyVersionMenu: 'No version menu',
          emptyVersionData: 'No version data'
        }
      }
    },
    global: {
      industry: {
        title: 'Industry Management',
        name: 'Industry Name',
        sort: 'Sort No.',
        desc: 'Description',
        createTime: 'Create Time',
        addIndustry: 'Add Industry',
        editIndustry: 'Edit Industry',
        form: {
          name: {
            required: 'Please enter Industry Name',
            invalid: 'Industry Name cannot be empty'
          },
          sort: {
            required: 'Please enter Sort No.',
            invalid: 'Sort No. cannot be empty'
          },
          desc: {
            required: 'Please enter Description',
            invalid: 'Description cannot be empty'
          }
        }
      },
      sysScreen: {
        title: 'Screen Management',
        name: 'Screen Name',
        cover: 'Screen Cover',
        status: 'Status',
        createTime: 'Create Time',
        routePath: 'Route Path',
        routeName: 'Route Name',
        componentPath: 'Component Path',
        industryType: 'Industry Type',
        projectConfig: 'Project Config',
        project: 'Project',
        mockData: 'Mock Data',
        visual3d: '3D Visualization',
        personalInfo: 'Personal Info',
        enterSystem: 'Enter System',
        logout: 'Logout',
        thumbnail: 'Thumbnail',
        addSysScreen: 'Add Screen',
        editSysScreen: 'Edit Screen',
        addProject: 'Add Project',
        form: {
          name: {
            required: 'Please enter Screen Name',
            invalid: 'Screen Name cannot be empty'
          },
          routePath: {
            required: 'Please enter Route Path',
            invalid: 'Route Path cannot be empty'
          },
          componentPath: {
            required: 'Please enter Component Path',
            invalid: 'Component Path cannot be empty'
          },
          thumbnail: {
            required: 'Please upload Thumbnail',
            invalid: 'Thumbnail cannot be empty'
          },
          industryType: {
            required: 'Please select Industry Type',
            invalid: 'Industry Type cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          project: {
            required: 'Please select Project',
            invalid: 'Project cannot be empty'
          }
        },
        message: {
          projectConfigRequired: 'Please add at least one project config',
          projectRequired: 'Please complete Project ID'
        },
        placeholder: {
          routePathExample: 'For example /smart-waterControl',
          routeNameExample: 'For example SmartWaterControl',
          componentPathExample: 'For example SmartWaterControl/index'
        }
      },
      activate: {
        title: 'Activation Code',
        eyebrow: 'SYSTEM LICENSE',
        description:
          'Select an activation strategy in order and submit. The generated result will be displayed on this page for immediate copying.',
        required: 'Required',
        licenseType: 'Activation Type',
        expireTime: 'Expiration Time',
        strategySpecified: 'Specified Time',
        strategySpecifiedDesc: 'An expiration time is required. A real Unix timestamp will be submitted.',
        strategyPermanent: 'Permanent Activation',
        strategyPermanentDesc: 'The time selection is ignored and license_expire_at = 0 is submitted.',
        stepSelectType: '1. Select Activation Type',
        stepSetExpireTime: '2. Set Expiration Time',
        stepGenerate: '3. Generate Activation Code',
        stepResult: '4. Generated Result',
        resetForm: 'Reset Form',
        generate: 'Generate Activation Code',
        copyLicense: 'Copy Activation Code',
        permanentDatePlaceholder: 'Permanent activation does not require a time',
        datePlaceholder: 'Please select expiration time (cannot be earlier than now)',
        previewPermanent: 'Submit: license_type = 2, license_expire_at = 0 (permanent activation)',
        previewPending: 'Submit: select an expiration time first',
        previewSpecified: 'Submit: license_type = 1, license_expire_at = {expireAt}',
        form: {
          licenseType: {
            required: 'Please select Activation Type',
            invalid: 'Activation Type cannot be empty'
          },
          expireTime: {
            required: 'Please select Expiration Time',
            invalid: 'Expiration Time cannot be empty'
          }
        },
        message: {
          clipboardUnsupported: 'Your browser does not support the Clipboard API',
          copyFailed: 'Copy failed. Please copy manually',
          copySuccess: 'Copy Success',
          generateSuccess: 'Activation code generated successfully'
        }
      },
      deviceTypeTemplate: {
        title: 'Device Type Template',
        categoryTitle: 'Device Type Template Category',
        emptyCategory: 'No device type template categories',
        name: 'Device Type Name',
        key: 'Identifier',
        typeKey: 'Type Identifier',
        icon: 'Icon',
        status: 'Status',
        desc: 'Description',
        sort: 'Sort',
        categoryName: 'Category Name',
        parentCategory: 'Category',
        updateTime: 'Update Time',
        pointManagement: 'Point Management',
        addDeviceType: 'Add Device Type',
        editDeviceType: 'Edit Device Type',
        addCategory: 'Add Device Type Template Category',
        editCategory: 'Edit Device Type Template Category',
        enable: 'Enable',
        disable: 'Disable',
        form: {
          parentCategory: {
            required: 'Please select Category',
            invalid: 'Category cannot be empty'
          },
          name: {
            required: 'Please enter Device Type Name',
            invalid: 'Device Type Name cannot be empty'
          },
          typeKey: {
            required: 'Please enter Type Identifier',
            invalid: 'Type Identifier cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          categoryName: {
            required: 'Please enter Category Name',
            invalid: 'Category Name cannot be empty'
          },
          sort: {
            required: 'Please enter Sort',
            invalid: 'Sort cannot be empty'
          },
          desc: {
            required: 'Please enter Description',
            invalid: 'Description cannot be empty'
          }
        },
        placeholder: {
          typeKey: 'Please enter Type Identifier, e.g. METER_001'
        },
        message: {
          selectCategory: 'Please select a category on the left'
        }
      },
      deviceTypeTemplatePoint: {
        title: 'Template Points',
        pointName: 'Point Name',
        pointKey: 'Point Identifier',
        dataType: 'Data Type',
        desc: 'Description',
        updateTime: 'Update Time',
        keyword: 'Point Keyword',
        addPoint: 'Add Point',
        editPoint: 'Edit Point',
        form: {
          keyword: {
            required: 'Please enter Point Keyword',
            invalid: 'Point Keyword cannot be empty'
          }
        },
        message: {
          missingTemplateId: 'Missing Template ID',
          missingPointId: 'Missing Point ID'
        }
      }
    },
    system: {
      client: {
        title: 'Client List',
        clientId: 'Client ID',
        clientKey: 'Client Key',
        clientSecret: 'Client Secret',
        grantTypeList: 'Grant Type',
        deviceType: 'Device Type',
        activeTimeout: 'Token Active Timeout',
        timeout: 'Token Timeout',
        status: 'Status',
        form: {
          clientId: {
            required: 'Please enter Client ID',
            invalid: 'Client ID cannot be empty'
          },
          clientKey: {
            required: 'Please enter Client Key',
            invalid: 'Client Key cannot be empty'
          },
          clientSecret: {
            required: 'Please enter Client Secret',
            invalid: 'Client Secret cannot be empty'
          },
          grantTypeList: {
            required: 'Please select Grant Type',
            invalid: 'Grant Type cannot be empty'
          },
          deviceType: {
            required: 'Please select Device Type',
            invalid: 'Device Type cannot be empty'
          },
          activeTimeout: {
            required: 'Please enter Active Timeout',
            invalid: 'Active Timeout cannot be empty',
            tooltip: 'Specify time without operation will expire (unit: second), default 30 minutes (1800 seconds)'
          },
          timeout: {
            required: 'Please enter Timeout',
            invalid: 'Timeout cannot be empty',
            tooltip: 'Specify time will expire (unit: second), default 7 days (604800 seconds)'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          }
        },
        addClient: 'Add Client',
        editClient: 'Edit Client'
      },
      config: {
        title: 'Config List',
        configName: 'Config Name',
        configKey: 'Config Key',
        configValue: 'Config Value',
        configType: 'Built-in',
        remark: 'Remark',
        createTime: 'Create Time',
        refreshCache: 'Refresh Cache',
        refreshCacheSuccess: 'Refresh cache successfully',
        form: {
          configId: {
            required: 'Please enter Config ID',
            invalid: 'Config ID cannot be empty'
          },
          configName: {
            required: 'Please enter Config Name',
            invalid: 'Config Name cannot be empty'
          },
          configKey: {
            required: 'Please enter Config Key',
            invalid: 'Config Key cannot be empty'
          },
          configValue: {
            required: 'Please enter Config Value',
            invalid: 'Config Value cannot be empty'
          },
          configType: {
            required: 'Please select Built-in status',
            invalid: 'Built-in status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          }
        },
        addConfig: 'Add Config',
        editConfig: 'Edit Config'
      },
      dept: {
        empty: 'No department information',
        title: 'Department List',
        parentId: 'Parent Department',
        name: 'Department Name',
        leader: 'Leader',
        sort: 'Sort',
        createTime: 'Create Time',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All',
        form: {
          parentId: {
            required: 'Please select Parent Department',
            invalid: 'Parent Department cannot be empty'
          },
          name: {
            required: 'Please enter Department Name',
            invalid: 'Department Name cannot be empty'
          },
          leader: {
            required: 'Please enter Leader',
            invalid: 'Leader cannot be empty'
          },
          sort: {
            required: 'Please enter Sort',
            invalid: 'Sort cannot be empty'
          }
        },
        error: {
          getDeptDataFail: 'Get dept data fail',
          getDeptUserDataFail: 'Get dept user data fail'
        },
        placeholder: {
          defaultLeaderPlaceHolder: 'Please select leader',
          addDataLeaderPlaceHolder: 'Department leader can be selected only when updating',
          deptUserIsEmptyLeaderPlaceHolder: 'Current dept has no leader'
        },
        addDept: 'Add Department',
        editDept: 'Edit Department'
      },
      dict: {
        title: 'Dictionary List',
        dictTypeTitle: 'Dictionary Type List',
        dictName: 'Dictionary Name',
        dictType: 'Dictionary Type',
        status: 'Status',
        remark: 'Remark',
        createTime: 'Create Time',
        refreshCacheSuccess: 'Refresh cache successfully',
        refreshCache: 'Refresh Cache',
        confirmDeleteDictType: 'Are you sure you want to delete dic type',
        data: {
          title: 'Dictionary Data List',
          label: 'Dictionary Label',
          value: 'Dictionary Value',
          dictSort: 'Sort',
          isDefault: 'Default',
          listClass: 'Display Style',
          cssClass: 'CSS Class',
          status: 'Status',
          remark: 'Remark',
          createTime: 'Create Time'
        },
        form: {
          dictId: {
            required: 'Please enter Dictionary Id',
            invalid: 'Dictionary Id cannot be empty'
          },
          dictCode: {
            required: 'Please enter Dictionary Code',
            invalid: 'Dictionary Code cannot be empty'
          },
          dictName: {
            required: 'Please enter Dictionary Name',
            invalid: 'Dictionary Name cannot be empty'
          },
          dictType: {
            required: 'Please enter Dictionary Type',
            invalid: 'Dictionary Type cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          },
          dictLabel: {
            required: 'Please enter Dictionary Label',
            invalid: 'Dictionary Label cannot be empty'
          },
          dictValue: {
            required: 'Please enter Dictionary Value',
            invalid: 'Dictionary Value cannot be empty'
          },
          dictSort: {
            required: 'Please enter Sort',
            invalid: 'Sort cannot be empty'
          },
          isDefault: {
            required: 'Please select Default',
            invalid: 'Default cannot be empty'
          },
          listClass: {
            required: 'Please select Display Style',
            invalid: 'Display Style cannot be empty'
          },
          cssClass: {
            required: 'Please enter CSS Class',
            invalid: 'CSS Class cannot be empty'
          }
        },
        addDict: 'Add Dictionary',
        editDict: 'Edit Dictionary',
        addDictData: 'Add Dictionary Data',
        editDictData: 'Edit Dictionary Data',
        addDictType: 'Add Dictionary Type',
        editDictType: 'Edit Dictionary Type',
        exportDictType: 'Export Dictionary Type',
        refreshDictType: 'Refresh Dictionary Type',
        dictTypeIsEmpty: 'Dictionary type is empty'
      },
      menu: {
        title: 'Menu List',
        parentId: 'Parent Menu',
        menuName: 'Menu Name',
        buttonName: 'Button Name',
        icon: 'Menu Icon',
        orderNum: 'Sort',
        perms: 'Permission Code',
        permission: 'Permission Key',
        component: 'Component Path',
        path: 'Route Path',
        routeName: 'Route Name',
        layout: 'Layout',
        defaultLayout: 'Default Layout',
        blankLayout: 'Blank Layout',
        externalPath: 'External Path',
        extLink: 'External Link',
        iframe: 'Iframe',
        query: 'Route Parameters',
        iframeQuery: 'Iframe Address',
        isFrame: 'External Link',
        isCache: 'Cache',
        menuType: 'Menu Type',
        visible: 'Visible',
        status: 'Status',
        createTime: 'Create Time',
        cache: 'cache',
        noCache: 'No Cache',
        rootName: 'Root',
        buttonPermissionList: 'Button Permission List',
        emptyMenu: 'Empty Menu',
        menuDetail: 'Menu Detail',
        cascadeDeleteContent: 'Cascade delete menu will delete the selected menu and all its sub-menus, are you sure?',
        expandCollapse: 'Expand/Collapse',
        selectDeselectAll: 'Select/Deselect All',
        parentChildCascade: 'Parent-Child Cascade',
        isFrameTip: 'If you choose External Link, the routing address needs to start with `http(s)://`',
        isCacheTip:
          'If you select yes, it will be cached by `keep-alive`, and the `name` and address of the matching component must be consistent',
        visibleTip: 'If you choose Hide, the route will not appear in the sidebar, but it can still be accessed.',
        statusTip: 'If you choose to disable, the route will not appear in the sidebar and cannot be accessed.',
        permsTip: "Permission string defined in the controller, such as: {'@'}SaCheckPermission('system:user:list')",
        componentTip:
          'The component path to access, such as: `system/user/index`, which is in the `views` directory by default',
        pathTip:
          'Router path，Example：`user`，If the external network address needs to be accessed in the internal link,then  `http(s)://` beginning',
        layoutTip:
          'Default Layout: A layout that includes common sections such as the global header, sidebar, footer, etc;\nBlank Layout: A layout without any common sections, typically used for pages like the login page',
        form: {
          parentId: {
            required: 'Please select Parent Menu',
            invalid: 'Parent Menu cannot be empty'
          },
          menuType: {
            required: 'Please select Menu Type',
            invalid: 'Menu Type cannot be empty'
          },
          icon: {
            required: 'Please select Menu Icon',
            invalid: 'Menu Icon cannot be empty'
          },
          menuIds: {
            required: 'Please select Menu',
            invalid: 'Menu cannot be empty'
          },
          menuName: {
            required: 'Please enter Menu Name',
            invalid: 'Menu Name cannot be empty'
          },
          perms: {
            required: 'Please enter permission code',
            invalid: 'Permission code cannot be empty'
          },
          orderNum: {
            required: 'Please enter order num',
            invalid: 'Order num cannot be empty'
          },
          isFrame: {
            required: 'Please select External Link',
            invalid: 'External Link cannot be empty'
          },
          path: {
            required: 'Please enter Route Path',
            invalid: 'Route Path cannot be empty'
          },
          routeName: {
            required: 'Please enter Route Name',
            invalid: 'Route Name cannot be empty'
          },
          component: {
            required: 'Please enter Component Path',
            invalid: 'Component Path cannot be empty'
          },
          query: {
            required: 'Please enter Route Parameters',
            invalid: 'Route Parameters cannot be empty'
          },
          isCache: {
            required: 'Please select Cache',
            invalid: 'Cache cannot be empty'
          },
          visible: {
            required: 'Please select Visible',
            invalid: 'Visible cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          permission: {
            required: 'Please enter Permission',
            invalid: 'Permission cannot be empty'
          }
        },
        placeholder: {
          queryKey: 'Please enter a key',
          queryValue: 'Please enter a value',
          queryIframe: 'Please enter a iframe address'
        },
        directory: 'Directory',
        menu: 'Menu',
        button: 'Button',
        addMenu: 'Add Menu',
        addChildMenu: 'Add Child Menu',
        editMenu: 'Edit Menu',
        cascadeDelete: 'Cascade Delete Menu'
      },
      notice: {
        title: 'Notice List',
        noticeTitle: 'Notice Title',
        noticeType: 'Notice Type',
        noticeContent: 'Notice Content',
        status: 'Status',
        createTime: 'Create Time',
        form: {
          noticeTitle: {
            required: 'Please enter Notice Title',
            invalid: 'Notice Title cannot be empty'
          },
          noticeType: {
            required: 'Please select Notice Type',
            invalid: 'Notice Type cannot be empty'
          },
          noticeContent: {
            required: 'Please enter Notice Content',
            invalid: 'Notice Content cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          }
        },
        addNotice: 'Add Notice',
        editNotice: 'Edit Notice'
      },
      oss: {
        title: 'File List',
        fileName: 'File Name',
        originalName: 'Original Name',
        fileSuffix: 'File Extension',
        url: 'File URL',
        createTime: 'Create Time',
        service: 'Service Provider',
        form: {
          file: {
            required: 'Please select a file',
            invalid: 'File cannot be empty'
          }
        },
        upload: 'Upload File',
        preview: 'Preview',
        download: 'Download',
        copy: 'Copy Link',
        copySuccess: 'Copy Success'
      },
      ossConfig: {
        title: 'OSS Config List',
        configKey: 'Config Key',
        accessKey: 'Access Key',
        secretKey: 'Secret Key',
        bucketName: 'Bucket Name',
        prefix: 'Prefix',
        endpoint: 'Endpoint',
        domain: 'Custom Domain',
        isHttps: 'HTTPS',
        region: 'Region',
        status: 'Status',
        remark: 'Remark',
        createTime: 'Create Time',
        form: {
          configKey: {
            required: 'Please enter Config Key',
            invalid: 'Config Key cannot be empty'
          },
          accessKey: {
            required: 'Please enter Access Key',
            invalid: 'Access Key cannot be empty'
          },
          secretKey: {
            required: 'Please enter Secret Key',
            invalid: 'Secret Key cannot be empty'
          },
          bucketName: {
            required: 'Please enter Bucket Name',
            invalid: 'Bucket Name cannot be empty'
          },
          prefix: {
            required: 'Please enter Prefix',
            invalid: 'Prefix cannot be empty'
          },
          endpoint: {
            required: 'Please enter Endpoint',
            invalid: 'Endpoint cannot be empty'
          },
          domain: {
            required: 'Please enter Custom Domain',
            invalid: 'Custom Domain cannot be empty'
          },
          isHttps: {
            required: 'Please select HTTPS',
            invalid: 'HTTPS cannot be empty'
          },
          region: {
            required: 'Please enter Region',
            invalid: 'Region cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          }
        },
        addOssConfig: 'Add OSS Config',
        editOssConfig: 'Edit OSS Config'
      },
      post: {
        title: 'Post List',
        postCode: 'Post Code',
        postName: 'Post Name',
        postSort: 'Post Sort',
        status: 'Status',
        remark: 'Remark',
        createTime: 'Create Time',
        form: {
          postCode: {
            required: 'Please enter Post Code',
            invalid: 'Post Code cannot be empty'
          },
          postName: {
            required: 'Please enter Post Name',
            invalid: 'Post Name cannot be empty'
          },
          postSort: {
            required: 'Please enter Post Sort',
            invalid: 'Post Sort cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          }
        },
        addPost: 'Add Post',
        editPost: 'Edit Post'
      },
      role: {
        title: 'Role List',
        roleName: 'Role Name',
        roleKey: 'Role Key',
        roleSort: 'Role Sort',
        roleType: 'Role Type',
        desc: 'Description',
        status: 'Status',
        remark: 'Remark',
        menuPermission: 'Menu Permission',
        dataScope: 'Data Scope',
        dataScopeRange: 'Data Scope',
        visualPermission: 'Visual Permission',
        createTime: 'Create Time',
        roleTypes: {
          systemAdmin: 'System Admin',
          normalMember: 'Normal Member'
        },
        dataScopes: {
          all: 'All Data Permission',
          self: 'Self Only Data Permission',
          dept: 'Department Data Permission',
          deptAndSub: 'Department and Sub-department Data Permission'
        },
        form: {
          roleName: {
            required: 'Please enter Role Name',
            invalid: 'Role Name cannot be empty'
          },
          roleKey: {
            required: 'Please enter Role Key',
            invalid: 'Role Key cannot be empty'
          },
          roleSort: {
            required: 'Please enter Role Sort',
            invalid: 'Role Sort cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          },
          desc: {
            required: 'Please enter Description',
            invalid: 'Description cannot be empty'
          },
          menuIds: {
            required: 'Please select Menu Permission',
            invalid: 'Menu Permission cannot be empty'
          },
          deptIds: {
            required: 'Please select Dept Permission',
            invalid: 'Dept Permission cannot be empty'
          }
        },
        addRole: 'Add Role',
        editRole: 'Edit Role',
        configPermission: 'Assign Permissions',
        authorizedUsers: 'Assign Users',
        selectMenuPermission: 'Select Menu Permission',
        selectDataScope: 'Select Data Scope',
        selectDeptPermission: 'Select Dept Permission',
        permissionConfig: 'Permission Configuration',
        permissionConfigWithName: '{name} Permission Configuration',
        visualTypes: {
          systemScreen: 'System Screen',
          configuration: 'Configuration Screen',
          customScreen: 'Custom Screen'
        },
        searchScreenName: 'Search screen name',
        searchConfigurationName: 'Search configuration name',
        permissionAll: 'Enable All Permissions',
        controlAll: 'Enable All Controls',
        visualPermissionStats: 'Authorized {selected} / {total}, controllable {control}',
        noScreen: 'No screen',
        noThumbnail: 'No thumbnail',
        permission: 'Permission',
        control: 'Control'
      },
      tenant: {
        title: 'Tenant List',
        tenantName: 'Tenant Name',
        tenantId: 'Tenant ID',
        contactUserName: 'Contact Person',
        contactPhone: 'Contact Phone',
        companyName: 'Company Name',
        licenseNumber: 'License Number',
        address: 'Address',
        intro: 'Introduction',
        domain: 'Domain',
        packageId: 'Tenant Package',
        expireTime: 'Expiration Time',
        accountCount: 'Account Count',
        status: 'Status',
        createTime: 'Create Time',
        form: {
          tenantName: {
            required: 'Please enter Tenant Name',
            invalid: 'Tenant Name cannot be empty'
          },
          contactUserName: {
            required: 'Please enter Contact Person',
            invalid: 'Contact Person cannot be empty'
          },
          contactPhone: {
            required: 'Please enter Contact Phone',
            invalid: 'Contact Phone cannot be empty'
          },
          companyName: {
            required: 'Please enter Company Name',
            invalid: 'Company Name cannot be empty'
          },
          licenseNumber: {
            required: 'Please enter License Number',
            invalid: 'License Number cannot be empty'
          },
          address: {
            required: 'Please enter Address',
            invalid: 'Address cannot be empty'
          },
          intro: {
            required: 'Please enter Introduction',
            invalid: 'Introduction cannot be empty'
          },
          domain: {
            required: 'Please enter Domain',
            invalid: 'Domain cannot be empty'
          },
          packageId: {
            required: 'Please select Tenant Package',
            invalid: 'Tenant Package cannot be empty'
          },
          expireTime: {
            required: 'Please select Expiration Time',
            invalid: 'Expiration Time cannot be empty'
          },
          accountCount: {
            required: 'Please enter Account Count',
            invalid: 'Account Count cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          }
        },
        addTenant: 'Add Tenant',
        editTenant: 'Edit Tenant'
      },
      tenantPackage: {
        title: 'Tenant Package List',
        packageName: 'Package Name',
        menuIds: 'Menu Permission',
        remark: 'Remark',
        status: 'Status',
        createTime: 'Create Time',
        form: {
          packageName: {
            required: 'Please enter Package Name',
            invalid: 'Package Name cannot be empty'
          },
          menuIds: {
            required: 'Please select Menu Permission',
            invalid: 'Menu Permission cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          }
        },
        addTenantPackage: 'Add Tenant Package',
        editTenantPackage: 'Edit Tenant Package',
        statusChangeSuccess: 'Status modified successfully'
      },
      user: {
        title: 'User List',
        userName: 'Username',
        nickName: 'Nickname',
        deptName: 'Department',
        roleName: 'Role',
        phonenumber: 'Phone Number',
        status: 'Status',
        createTime: 'Create Time',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        sex: 'Gender',
        roleIds: 'Roles',
        postIds: 'Posts',
        email: 'Email',
        expiredAt: 'Expiration Time',
        expiredAtPlaceholder: 'Leave blank for permanent',
        avatar: 'Avatar',
        remark: 'Remark',
        form: {
          userName: {
            required: 'Please enter Username',
            invalid: 'Username cannot be empty'
          },
          nickName: {
            required: 'Please enter Nickname',
            invalid: 'Nickname cannot be empty'
          },
          deptId: {
            required: 'Please select Department',
            invalid: 'Department cannot be empty'
          },
          phonenumber: {
            required: 'Please enter Phone Number',
            invalid: 'Phone Number cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          password: {
            required: 'Please enter Password',
            invalid: 'Password cannot be empty'
          },
          confirmPassword: {
            required: 'Please enter Confirm Password',
            invalid: 'Confirm Password cannot be empty'
          },
          sex: {
            required: 'Please select Gender',
            invalid: 'Gender cannot be empty'
          },
          roleIds: {
            required: 'Please select Roles',
            invalid: 'Roles cannot be empty'
          },
          postIds: {
            required: 'Please select Posts',
            invalid: 'Posts cannot be empty'
          },
          email: {
            required: 'Please enter Email',
            invalid: 'Email cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          }
        },
        addUser: 'Add User',
        editUser: 'Edit User',
        resetPassword: 'Reset Password',
        resetPasswordConfirmTitle: 'Reset Password Confirmation',
        resetPasswordConfirmButton: 'Confirm Reset',
        resetPasswordConfirmPrefix: "Confirm reset this user's password to ",
        resetPasswordConfirmSuffix: '?',
        resetPasswordSuccess: 'Password has been reset to {password}',
        importUsers: 'Import Users',
        exportTemplate: 'Export Template',
        importSuccess: 'Import successful',
        statusChangeSuccess: 'Status modified successfully'
      }
    },
    about: {
      title: 'About',
      introduction: `RuoYi-Plus-Soybean is a modern, enterprise-level multi-tenant management system. It combines the powerful backend capabilities of RuoYi-Vue-Plus with the modern frontend features of Soybean Admin, providing developers with a complete enterprise management solution.`,
      projectInfo: {
        title: 'Project Info',
        version: 'Version',
        latestBuildTime: 'Latest Build Time',
        documentLink: 'Document Link',
        previewLink: 'Preview Link',
        repositoryLink: 'Repository Link'
      },
      prdDep: 'Production Dependency',
      devDep: 'Development Dependency'
    }
  },
  form: {
    required: 'Cannot be empty',
    userName: {
      required: 'Please enter user name',
      invalid: 'User name format is incorrect'
    },
    phone: {
      required: 'Please enter phone number',
      invalid: 'Phone number format is incorrect'
    },
    pwd: {
      required: 'Please enter password',
      invalid: '6-18 characters, including letters, numbers, and underscores'
    },
    confirmPwd: {
      required: 'Please enter password again',
      invalid: 'The two passwords are inconsistent'
    },
    code: {
      required: 'Please enter verification code',
      invalid: 'Verification code format is incorrect'
    },
    email: {
      required: 'Please enter email',
      invalid: 'Email format is incorrect'
    }
  },
  dropdown: {
    closeCurrent: 'Close Current',
    closeOther: 'Close Other',
    closeLeft: 'Close Left',
    closeRight: 'Close Right',
    closeAll: 'Close All',
    pin: 'Pin Tab',
    unpin: 'Unpin Tab'
  },
  icon: {
    themeConfig: 'Theme Configuration',
    themeSchema: 'Theme Schema',
    lang: 'Switch Language',
    fullscreen: 'Fullscreen',
    fullscreenExit: 'Exit Fullscreen',
    reload: 'Reload Page',
    collapse: 'Collapse Menu',
    expand: 'Expand Menu',
    pin: 'Pin',
    unpin: 'Unpin',
    manual: 'Manual'
  },
  datatable: {
    itemCount: 'Total {total} items',
    fixed: {
      left: 'Left Fixed',
      right: 'Right Fixed',
      unFixed: 'Unfixed'
    }
  }
};

export default local;
