/** The global namespace for the app */
declare namespace App {
  /** Theme namespace */
  namespace Theme {
    type ColorPaletteNumber = import('@sa/color').ColorPaletteNumber;

    /** NaiveUI theme overrides that can be specified in preset */
    type NaiveUIThemeOverride = import('naive-ui').GlobalThemeOverrides;

    /** Theme setting */
    interface ThemeSetting {
      /** Theme scheme */
      themeScheme: UnionKey.ThemeScheme;
      /** grayscale mode */
      grayscale: boolean;
      /** colour weakness mode */
      colourWeakness: boolean;
      /** Whether to recommend color */
      recommendColor: boolean;
      /** Theme color */
      themeColor: string;
      /** Theme radius */
      themeRadius: number;
      /** Other color */
      otherColor: OtherColor;
      /** Whether info color is followed by the primary color */
      isInfoFollowPrimary: boolean;
      /** Layout */
      layout: {
        /** Layout mode */
        mode: UnionKey.ThemeLayoutMode;
        /** Scroll mode */
        scrollMode: UnionKey.ThemeScrollMode;
      };
      /** Page */
      page: {
        /** Whether to show the page transition */
        animate: boolean;
        /** Page animate mode */
        animateMode: UnionKey.ThemePageAnimateMode;
      };
      /** Header */
      header: {
        /** Header height */
        height: number;
        /** Header breadcrumb */
        breadcrumb: {
          /** Whether to show the breadcrumb */
          visible: boolean;
          /** Whether to show the breadcrumb icon */
          showIcon: boolean;
        };
        /** Multilingual */
        multilingual: {
          /** Whether to show the multilingual */
          visible: boolean;
        };
        globalSearch: {
          /** Whether to show the GlobalSearch */
          visible: boolean;
        };
      };
      /** Tab */
      tab: {
        /** Whether to show the tab */
        visible: boolean;
        /**
         * Whether to cache the tab
         *
         * If cache, the tabs will get from the local storage when the page is refreshed
         */
        cache: boolean;
        /** Tab height */
        height: number;
        /** Tab mode */
        mode: UnionKey.ThemeTabMode;
        /** Whether to close tab by middle click */
        closeTabByMiddleClick: boolean;
      };
      /** Fixed header and tab */
      fixedHeaderAndTab: boolean;
      /** Sider */
      sider: {
        /** Inverted sider */
        inverted: boolean;
        /** Sider width */
        width: number;
        /** Collapsed sider width */
        collapsedWidth: number;
        /** Sider width when the layout is 'vertical-mix', 'top-hybrid-sidebar-first', or 'top-hybrid-header-first' */
        mixWidth: number;
        /**
         * Collapsed sider width when the layout is 'vertical-mix', 'top-hybrid-sidebar-first', or
         * 'top-hybrid-header-first'
         */
        mixCollapsedWidth: number;
        /** Child menu width when the layout is 'vertical-mix', 'top-hybrid-sidebar-first', or 'top-hybrid-header-first' */
        mixChildMenuWidth: number;
        /** Whether to auto select the first submenu */
        autoSelectFirstMenu: boolean;
      };
      /** Footer */
      footer: {
        /** Whether to show the footer */
        visible: boolean;
        /** Whether fixed the footer */
        fixed: boolean;
        /** Footer height */
        height: number;
        /**
         * Whether float the footer to the right when the layout is 'top-hybrid-sidebar-first' or
         * 'top-hybrid-header-first'
         */
        right: boolean;
      };
      /** Watermark */
      watermark: {
        /** Whether to show the watermark */
        visible: boolean;
        /** Watermark text */
        text: string;
        /** Whether to use user name as watermark text */
        enableUserName: boolean;
        /** Whether to use current time as watermark text */
        enableTime: boolean;
        /** Time format for watermark text */
        timeFormat: string;
      };
      table: {
        /** Whether to show the table border */
        bordered: boolean;
        /** Whether to show the table bottom border */
        bottomBordered: boolean;
        /** Whether to show the table single column */
        singleColumn: boolean;
        /** Whether to show the table single line */
        singleLine: boolean;
        /** Whether to show the table size */
        size: UnionKey.ThemeTableSize;
        /** Whether to show the table striped */
        striped: boolean;
      };
      /** define some theme settings tokens, will transform to css variables */
      tokens: {
        light: ThemeSettingToken;
        dark?: {
          [K in keyof ThemeSettingToken]?: Partial<ThemeSettingToken[K]>;
        };
      };
    }

    interface OtherColor {
      info: string;
      success: string;
      warning: string;
      error: string;
    }

    interface ThemeColor extends OtherColor {
      primary: string;
    }

    type ThemeColorKey = keyof ThemeColor;

    type ThemePaletteColor = {
      [key in ThemeColorKey | `${ThemeColorKey}-${ColorPaletteNumber}`]: string;
    };

    type BaseToken = Record<string, Record<string, string>>;

    interface ThemeSettingTokenColor {
      /** the progress bar color, if not set, will use the primary color */
      nprogress?: string;
      container: string;
      layout: string;
      inverted: string;
      'base-text': string;
    }

    interface ThemeSettingTokenBoxShadow {
      header: string;
      sider: string;
      tab: string;
    }

    interface ThemeSettingToken {
      colors: ThemeSettingTokenColor;
      boxShadow: ThemeSettingTokenBoxShadow;
    }

    type ThemeTokenColor = ThemePaletteColor & ThemeSettingTokenColor;

    /** Theme token CSS variables */
    type ThemeTokenCSSVars = {
      colors: ThemeTokenColor & { [key: string]: string };
      boxShadow: ThemeSettingTokenBoxShadow & { [key: string]: string };
    };
  }

  /** Global namespace */
  namespace Global {
    type VNode = import('vue').VNode;
    type RouteLocationNormalizedLoaded = import('vue-router').RouteLocationNormalizedLoaded;
    type RouteKey = import('@elegant-router/types').RouteKey;
    type RouteMap = import('@elegant-router/types').RouteMap;
    type RoutePath = import('@elegant-router/types').RoutePath;
    type LastLevelRouteKey = import('@elegant-router/types').LastLevelRouteKey;

    /** The router push options */
    type RouterPushOptions = {
      query?: Record<string, string>;
      params?: Record<string, string>;
      force?: boolean;
    };

    /** The global header props */
    interface HeaderProps {
      /** Whether to show the logo */
      showLogo?: boolean;
      /** Whether to show the menu toggler */
      showMenuToggler?: boolean;
      /** Whether to show the menu */
      showMenu?: boolean;
    }

    /** The global menu */
    type Menu = {
      /**
       * The menu key
       *
       * Equal to the route key
       */
      key: string;
      /** The menu label */
      label: string;
      /** The menu i18n key */
      i18nKey?: I18n.I18nKey | null;
      /** The route key */
      routeKey: RouteKey;
      /** The route path */
      routePath: RoutePath;
      /** The menu icon */
      icon?: () => VNode;
      /** The menu children */
      children?: Menu[];
    };

    type Breadcrumb = Omit<Menu, 'children'> & {
      options?: Breadcrumb[];
    };

    /** Tab route */
    type TabRoute = Pick<RouteLocationNormalizedLoaded, 'name' | 'path' | 'meta'> &
      Partial<Pick<RouteLocationNormalizedLoaded, 'fullPath' | 'query' | 'matched'>>;

    /** The global tab */
    type Tab = {
      /** The tab id */
      id: string;
      /** The tab label */
      label: string;
      /**
       * The new tab label
       *
       * If set, the tab label will be replaced by this value
       */
      newLabel?: string;
      /**
       * The old tab label
       *
       * when reset the tab label, the tab label will be replaced by this value
       */
      oldLabel?: string;
      /** The tab route key */
      routeKey: LastLevelRouteKey;
      /** The tab route path */
      routePath: RouteMap[LastLevelRouteKey];
      /** The tab route full path */
      fullPath: string;
      /** The tab fixed index */
      fixedIndex?: number | null;
      /**
       * Tab icon
       *
       * Iconify icon
       */
      icon?: string;
      /**
       * Tab local icon
       *
       * Local icon
       */
      localIcon?: string;
      /** I18n key */
      i18nKey?: I18n.I18nKey | null;
    };

    /** Form rule */
    type FormRule = import('naive-ui').FormItemRule;

    /** The global dropdown key */
    type DropdownKey = 'closeCurrent' | 'closeOther' | 'closeLeft' | 'closeRight' | 'closeAll' | 'pin' | 'unpin';
  }

  /**
   * I18n namespace
   *
   * Locales type
   */
  namespace I18n {
    type LangType = 'en-US' | 'zh-CN';

    type LangOption = {
      label: string;
      key: LangType;
    };

    type I18nRouteKey = string;

    type FormMsg = {
      required: string;
      invalid: string;
      tooltip?: string;
    };

    type Schema = {
      system: {
        title: {
          pt: string;
          cp: string;
          pj: string;
        };
        updateTitle: string;
        updateContent: string;
        updateConfirm: string;
        updateCancel: string;
      };
      systemLog: {
        title: string;
        deviceTitle: string;
        fields: {
          device: string;
          point: string;
          operator: string;
          time: string;
          operateType: string;
          operateModule: string;
          ip: string;
          detail: string;
          executeResult: string;
          failReason: string;
        };
        placeholders: {
          device: string;
          point: string;
          operator: string;
          operateType: string;
          operateModule: string;
          ip: string;
        };
        result: { success: string; failure: string };
        defaultOperator: string;
        operateTypeOptions: Record<string, string>;
        operateModuleOptions: Record<string, string>;
      };
      toolbox: {
        title: string;
        description: string;
        downloadApp: string;
        scanDownload: string;
        tabs: { discovery: string; ping: string; telnet: string };
        result: string;
        common: {
          host: string;
          hostPlaceholder: string;
          count: string;
          timeout: string;
          port: string;
          startTest: string;
          startConnect: string;
          elapsed: string;
          ip: string;
          latency: string;
          success: string;
          failure: string;
        };
        ping: {
          description: string;
          targetIp: string;
          minLatency: string;
          avgLatency: string;
          maxLatency: string;
          status: string;
          steps: { resolve: string; send: string; latency: string; summary: string };
          sending: string;
          failed: string;
          ready: string;
          waiting: string;
          idle: string;
          running: string;
        };
        telnet: {
          description: string;
          steps: { resolve: string; connect: string; wait: string; status: string };
          connecting: string;
          failed: string;
          ready: string;
          waiting: string;
          idle: string;
          running: string;
        };
        discovery: {
          description: string;
          interface: string;
          interfacePlaceholder: string;
          steps: { interface: string; segment: string; probe: string; collect: string };
          scanning: string;
          failed: string;
          ready: string;
          waiting: string;
          startWaiting: string;
          targetWaiting: string;
          localAddress: string;
          segment: string;
          broadcast: string;
          target: string;
          address: string;
          system: string;
          empty: string;
          scanningShort: string;
          start: string;
          running: string;
          scanned: string;
          found: string;
        };
        validation: { host: string; count: string; timeout: string; port: string };
        status: {
          idle: string;
          running: string;
          success: string;
          error: string;
          requestFailed: string;
          unknown: string;
          connected: string;
          refused: string;
          timedOut: string;
          unreachable: string;
          dnsFailed: string;
        };
      };
      visualCustomScreen: {
        list: string;
        thumbnail: string;
        name: string;
        key: string;
        lastSaveUser: string;
        lastPublishUser: string;
        publishStatus: string;
        published: string;
        unpublished: string;
        updatedAt: string;
        design: string;
        preview: string;
        clone: string;
        cloneTitle: string;
        addTitle: string;
        editTitle: string;
        description: string;
        namePlaceholder: string;
        descriptionPlaceholder: string;
        missingKeyDesign: string;
        missingKeyPreview: string;
      };
      visualConfiguration: {
        all: string;
        list: string;
        category: string;
        emptyCategory: string;
        categoryName: string;
        name: string;
        key: string;
        description: string;
        namePlaceholder: string;
        descriptionPlaceholder: string;
        categoryPlaceholder: string;
        parentCategory: string;
        categoryNamePlaceholder: string;
        addCategory: string;
        editCategory: string;
        add: string;
        edit: string;
        clone: string;
        cloneTitle: string;
        design: string;
        preview: string;
        thumbnail: string;
        lastSaveUser: string;
        lastPublishUser: string;
        publishStatus: string;
        published: string;
        unpublished: string;
        updatedAt: string;
        notPublished: string;
      };
      visualSysScreen: {
        title: string;
        screenTitle: string;
        systemName: string;
        cover: string;
        status: string;
        createdAt: string;
        tagManagement: string;
        edit: string;
        name: string;
        namePlaceholder: string;
        titlePlaceholder: string;
      };
      visualSysScreenTag: Record<string, string>;
      effroom: {
        overview: string;
        totalEnergy: string;
        totalCooling: string;
        carbonEmission: string;
        averageCop: string;
        statisticGranularity: string;
        statisticMethod: string;
        query: string;
        fullscreen: string;
        noData: string;
        hour: string;
        day: string;
        month: string;
        year: string;
        last: string;
        average: string;
        difference: string;
        first: string;
        pointSelection: string;
        pointCompare: string;
        pointSearchPlaceholder: string;
        noSelectablePoints: string;
        selectPointsHint: string;
        selectedPoints: string;
        value: string;
        timeRange: string;
        valueMethod: string;
        refresh: string;
        back: string;
        export: string;
        chartView: string;
        tableView: string;
        time: string;
        maxPoints: string;
        trendFetchFailed: string;
        noDataForCondition: string;
        websocketWarning: string;
        exportSubmitted: string;
        finestGranularity: string;
        calendar: string;
        energy: string;
        cooling: string;
        recentHour: string;
        recentDay: string;
        recent7Days: string;
        recentMonth: string;
        recent3Months: string;
        recentYear: string;
      };
      ledger: {
        assetsManagement: string;
        assetsTypeManagement: string;
        assetsNo: string;
        assetsName: string;
        qrCode: string;
        assetsType: string;
        dept: string;
        purchasePrice: string;
        assetsStatus: string;
        createdAt: string;
        view: string;
        normal: string;
        repair: string;
        scrapped: string;
        import: string;
        batchDownloadQr: string;
        noQr: string;
        downloadStarted: string;
        wsWarning: string;
        exportSubmitted: string;
        exportName: string;
        qrAlt: string;
        viewAssets: string;
        basicInfo: string;
        assetsId: string;
        projectId: string;
        updatedAt: string;
        belongDevice: string;
        attribution: string;
        location: string;
        owner: string;
        procurement: string;
        purchaseAt: string;
        supplier: string;
        expireAt: string;
        expireNotice: string;
        remark: string;
        noAssets: string;
        addAssets: string;
        editAssets: string;
        addAssetsType: string;
        editAssetsType: string;
        assetsTypeName: string;
        status: string;
        desc: string;
        enabled: string;
        disabled: string;
        selectStatus: string;
        select: string;
        input: string;
        selectAssetsType: string;
        selectDept: string;
        selectDevice: string;
        selectDate: string;
        inputLocation: string;
        inputOwner: string;
        inputPrice: string;
        inputSupplier: string;
        inputNotice: string;
        inputDesc: string;
        inputRemark: string;
        searchAssetsNo: string;
        searchAssetsName: string;
        qrTaskName: string;
        typeName: string;
        noData: string;
      };
      energy: {
        list: string;
        runTime: string;
        device: string;
        point: string;
        date: string;
        time: string;
        aggregation: string;
        range: string;
        energyType: string;
        space: string;
        selectDevice: string;
        selectAggregation: string;
        selectEnergyType: string;
        selectSpace: string;
        hour: string;
        day: string;
        month: string;
        year: string;
        runtimeHour: string;
        exportName: string;
        wsWarning: string;
        exportSubmitted: string;
      };
      messageRule: {
        management: string;
        name: string;
        gateway: string;
        type: string;
        status: string;
        report: string;
        command: string;
        enabled: string;
        disabled: string;
        add: string;
        edit: string;
        view: string;
        namePlaceholder: string;
        gatewayPlaceholder: string;
        typePlaceholder: string;
        statusPlaceholder: string;
        scriptPlaceholder: string;
        scriptLabel: string;
        testDataLabel: string;
        validateScript: string;
        validateResultLabel: string;
        invalidTestData: string;
        format: string;
        formatJsonError: string;
        formatScriptError: string;
      };
      workorder: {
        list: string;
        repair: string;
        deal: string;
        pending: string;
        processing: string;
        completed: string;
        cancelled: string;
        system: string;
        orderNo: string;
        device: string;
        repairman: string;
        repairPhone: string;
        dealer: string;
        dealerPhone: string;
        createdAt: string;
        status: string;
        assign: string;
        cancelAssign: string;
        handle: string;
        detail: string;
        add: string;
        allocation: string;
        dealTitle: string;
        detailTitle: string;
        selectRepairman: string;
        selectDealer: string;
        selectStatus: string;
        selectSpace: string;
        selectDevice: string;
        selectPoint: string;
        description: string;
        descriptionPlaceholder: string;
        handlingDescription: string;
        handlingPlaceholder: string;
        images: string;
        handlingImages: string;
        noImages: string;
        allocationSuccess: string;
        cancelAllocationSuccess: string;
        dealSuccess: string;
        uploadPending: string;
        uploadBreakImage: string;
        uploadDealImage: string;
      };
      space: {
        management: string;
        name: string;
        key: string;
        type: string;
        description: string;
        expandAll: string;
        collapseAll: string;
        add: string;
        edit: string;
        parent: string;
        selectParent: string;
        selectType: string;
        namePlaceholder: string;
        keyPlaceholder: string;
        descriptionPlaceholder: string;
        searchName: string;
      };
      spaceType: {
        management: string;
        name: string;
        description: string;
        createdAt: string;
        add: string;
        edit: string;
        namePlaceholder: string;
        descriptionPlaceholder: string;
        keywordPlaceholder: string;
        config: string;
        configDescription: string;
        save: string;
        export: string;
        dataConfig: string;
        selected: string;
        sheet: string;
        cell: string;
        selection: string;
        content: string;
        contentPlaceholder: string;
        applyTo: string;
        hint: string;
        unsaved: string;
        unsavedChanges: string;
      };
      alarmNoticeGroup: {
        management: string;
        name: string;
        type: string;
        member: string;
        receiver: string;
        way: string;
        sms: string;
        inApp: string;
        app: string;
        description: string;
        createdAt: string;
        add: string;
        edit: string;
        namePlaceholder: string;
        typePlaceholder: string;
        receiverPlaceholder: string;
        wayPlaceholder: string;
        descriptionPlaceholder: string;
      };
      alarmRecord: {
        title: string;
        alarmRule: string;
        alarmDevice: string;
        alarmLevel: string;
        selectAlarmRule: string;
        selectAlarmLevel: string;
        alarmContent: string;
        alarmTime: string;
        status: string;
        pending: string;
        confirmed: string;
        recovered: string;
        confirm: string;
        recover: string;
        generateWorkorder: string;
        detail: string;
        detailTitle: string;
        confirmProcess: string;
        confirmProcessPrompt: string;
        recoverPrompt: string;
        generateWorkorderPrompt: string;
        confirmSuccess: string;
        recoverSuccess: string;
        batchConfirmSuccess: string;
        batchRecoverSuccess: string;
        batchConfirm: string;
        batchRecover: string;
        batchConfirmPrompt: string;
        batchRecoverPrompt: string;
        generateWorkorderSuccess: string;
        basicInfo: string;
        content: string;
        contentTag: string;
        noContent: string;
        operationRecords: string;
        step: string;
        operator: string;
        system: string;
        unknownOperator: string;
        noOperationRecords: string;
        noDetail: string;
      };
      alarmRule: {
        title: string;
        name: string;
        namePlaceholder: string;
        alarmLevel: string;
        alarmLevelPlaceholder: string;
        levelNormal: string;
        levelImportant: string;
        levelUrgent: string;
        triggerType: string;
        triggerTypeDevicePointChange: string;
        deviceSourceType: string;
        deviceSource: string;
        device: string;
        deviceType: string;
        triggerCondition: string;
        noticeGroup: string;
        status: string;
        statusPlaceholder: string;
        add: string;
        edit: string;
        description: string;
        descriptionPlaceholder: string;
        noticeSettings: string;
        noticeGroupPlaceholder: string;
        noticeLimit: string;
        noticeLimitPlaceholder: string;
        autoGenerateWorkorder: string;
        systemAutoRecover: string;
        validHour: string;
        enabled: string;
        disabled: string;
        yes: string;
        no: string;
        selectValidHour: string;
        durationSecond: string;
        durationMinute: string;
        durationHour: string;
        duration: string;
        repeat: string;
        listSeparator: string;
        hourAriaLabel: string;
      };
      taskLog: {
        title: string;
        taskName: string;
        taskNamePlaceholder: string;
        taskType: string;
        taskTypePlaceholder: string;
        targetDevice: string;
        executionTime: string;
        detail: string;
        basicInfo: string;
        triggerCondition: string;
        conditionItem: string;
        triggerDevice: string;
        triggerPoint: string;
        executionContent: string;
        device: string;
        point: string;
        continuousTimes: string;
        status: string;
        scheduleConfig: string;
        scheduleType: string;
        repeatType: string;
        executionWeekday: string;
        executionDate: string;
        executionTimeList: string;
        dateGroup: string;
        pollingInterval: string;
        calendarBranch: string;
        inRange: string;
        outOfRange: string;
        timeRange: string;
        action: string;
        noTriggerPoints: string;
        noTriggerCondition: string;
        noScheduleConfig: string;
        noAction: string;
        noDetail: string;
        success: string;
        failure: string;
        taskTypeCondition: string;
        taskTypeScheduled: string;
        scheduleOnce: string;
        schedulePeriodic: string;
        scheduleInterval: string;
        scheduleByPlan: string;
        scheduleCalendar: string;
        sunday: string;
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        repeatDaily: string;
        repeatCustom: string;
        intervalSecond: string;
        intervalMinute: string;
        intervalHour: string;
      };
      taskList: {
        title: string;
        taskName: string;
        taskNamePlaceholder: string;
        taskType: string;
        targetDevice: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        remark: string;
        view: string;
        execute: string;
        executePrompt: string;
        executeSuccess: string;
        detail: string;
        add: string;
        edit: string;
        taskTypePlaceholder: string;
        basicInfo: string;
        scheduleConfig: string;
        noTriggerCondition: string;
        noScheduleConfig: string;
        noAction: string;
        noDetail: string;
        deviceSource: string;
        dataType: string;
        executionValue: string;
        outOfRangeValue: string;
        conditionRelation: string;
        scheduleType: string;
        repeatMethod: string;
        dateGroup: string;
        intervalTime: string;
        executionDate: string;
        executionTime: string;
        delaySeconds: string;
        continuousTimes: string;
        executeAction: string;
        statusPlaceholder: string;
        enabled: string;
        disabled: string;
        descriptionPlaceholder: string;
        scheduleSettings: string;
        executionTimePlaceholder: string;
        executionWeekday: string;
        executionTimeNode: string;
        addTimeNode: string;
        deleteTimeNode: string;
        intervalTimePlaceholder: string;
        timeUnit: string;
        addDateGroup: string;
        deleteDateGroup: string;
        pollingInterval: string;
        pollingIntervalPlaceholder: string;
        seconds: string;
        times: string;
        all: string;
        clear: string;
        previousYear: string;
        nextYear: string;
        year: string;
        month: string;
        selectedDays: string;
        executionDatePlaceholder: string;
        selectExecutionDate: string;
        selectDateGroupDate: string;
        activeTimeRange: string;
        editTimeRange: string;
        startTime: string;
        endTime: string;
        alignTimeHint: string;
        adjustStartTime: string;
        adjustEndTime: string;
        deleteTimeRange: string;
        notSelected: string;
        triggerCondition: string;
        addCondition: string;
        conditionItem: string;
        deleteCondition: string;
        relationPlaceholder: string;
        pointThreshold: string;
        addThreshold: string;
        pointPlaceholder: string;
        thresholdPlaceholder: string;
        deletePoint: string;
        triggerFrequency: string;
        duration: string;
        repeatCount: string;
        addAction: string;
        actionItem: string;
        deleteAction: string;
        executeDevice: string;
        executePointSettings: string;
        addPoint: string;
        deviceType: string;
        deviceTypePlaceholder: string;
        devicePlaceholder: string;
        pointValuePlaceholder: string;
        textValuePlaceholder: string;
        enumValuePlaceholder: string;
        minValue: string;
        maxValue: string;
        between: string;
        calendarAction: string;
        addDevice: string;
        deviceItem: string;
        inside: string;
        outside: string;
        selectPoint: string;
        maxConditions: string;
        maxConditionPoints: string;
        maxActions: string;
        maxActionPoints: string;
        selectDevice: string;
        selectActionDevice: string;
        duplicatePoint: string;
        pointRangeMismatch: string;
        selectActionPoint: string;
        missingDataType: string;
        unsupportedThreshold: string;
        invalidRange: string;
        inputValue: string;
        invalidDelay: string;
        invalidContinuousTimes: string;
        selectExecutionTime: string;
        futureExecutionTime: string;
        selectWeekday: string;
        positiveIntegerInterval: string;
        addDateGroupValidation: string;
        completeDateGroupTime: string;
        validDateGroupTime: string;
        invalidDateGroupTime: string;
        selectExecutionNode: string;
        completeExecutionNode: string;
        open: string;
        close: string;
        to: string;
        valuePlaceholder: string;
        switchValuePlaceholder: string;
        conditionAnd: string;
        conditionRelationOr: string;
        conditionOnlyOr: string;
        selectConditionPoint: string;
        conditionLabel: string;
        actionLabel: string;
        greaterThan: string;
        lessThan: string;
        greaterOrEqual: string;
        lessOrEqual: string;
        notBetween: string;
        equal: string;
        notEqual: string;
        minutes: string;
        hours: string;
        addCalendarDeviceValidation: string;
        selectCalendarDevice: string;
        selectCalendarPoint: string;
        duplicateCalendarPoint: string;
        calendarPointRangeMismatch: string;
        selectCalendarPointDetail: string;
        inputCalendarInsideValue: string;
        inputCalendarOutsideValue: string;
      };
      common: {
        rootDirectory: string;
        action: string;
        add: string;
        addSuccess: string;
        backToHome: string;
        batchDelete: string;
        import: string;
        export: string;
        importSuccess: string;
        importFail: string;
        importTemplate: string;
        downloadTemplate: string;
        importResult: string;
        importEnd: string;
        importFormat: string;
        importSize: string;
        importTip: string;
        exportSuccess: string;
        exportFail: string;
        updateExisting: string;
        cancel: string;
        close: string;
        check: string;
        selectAll: string;
        expandColumn: string;
        columnSetting: string;
        config: string;
        login: string;
        confirm: string;
        save: string;
        delete: string;
        deleteSuccess: string;
        confirmDelete: string;
        enabled: string;
        disabled: string;
        edit: string;
        download: string;
        warning: string;
        error: string;
        index: string;
        keywordSearch: string;
        logout: string;
        logoutConfirm: string;
        lookForward: string;
        modify: string;
        modifySuccess: string;
        noData: string;
        unknown: string;
        operate: string;
        pleaseCheckValue: string;
        refresh: string;
        reset: string;
        search: string;
        switch: string;
        tip: string;
        trigger: string;
        update: string;
        updateSuccess: string;
        saveSuccess: string;
        noChange: string;
        userCenter: string;
        yesOrNo: {
          yes: string;
          no: string;
        };
        second: string;
        selected: string;
        anyRecords: string;
        clear: string;
        noSelectRecord: string;
      };
      request: {
        logout: string;
        logoutMsg: string;
        logoutWithModal: string;
        logoutWithModalMsg: string;
        refreshToken: string;
        tokenExpired: string;
      };
      theme: {
        themeDrawerTitle: string;
        tabs: {
          appearance: string;
          layout: string;
          general: string;
          preset: string;
        };
        appearance: {
          themeSchema: { title: string } & Record<UnionKey.ThemeScheme, string>;
          grayscale: string;
          colourWeakness: string;
          themeColor: {
            title: string;
            followPrimary: string;
          } & Record<Theme.ThemeColorKey, string>;
          recommendColor: string;
          recommendColorDesc: string;
          themeRadius: {
            title: string;
          };
          preset: {
            title: string;
            apply: string;
            applySuccess: string;
            [key: string]:
              | {
                  name: string;
                  desc: string;
                }
              | string;
          };
        };
        layout: {
          layoutMode: { title: string } & Record<UnionKey.ThemeLayoutMode, string> & {
              [K in `${UnionKey.ThemeLayoutMode}_detail`]: string;
            };
          tab: {
            title: string;
            visible: string;
            cache: string;
            cacheTip: string;
            height: string;
            mode: { title: string } & Record<UnionKey.ThemeTabMode, string>;
            closeByMiddleClick: string;
            closeByMiddleClickTip: string;
          };
          header: {
            title: string;
            height: string;
            breadcrumb: {
              visible: string;
              showIcon: string;
            };
          };
          sider: {
            title: string;
            inverted: string;
            width: string;
            collapsedWidth: string;
            mixWidth: string;
            mixCollapsedWidth: string;
            mixChildMenuWidth: string;
            autoSelectFirstMenu: string;
            autoSelectFirstMenuTip: string;
          };
          footer: {
            title: string;
            visible: string;
            fixed: string;
            height: string;
            right: string;
          };
          content: {
            title: string;
            scrollMode: { title: string; tip: string } & Record<UnionKey.ThemeScrollMode, string>;
            page: {
              animate: string;
              mode: { title: string } & Record<UnionKey.ThemePageAnimateMode, string>;
            };
            fixedHeaderAndTab: string;
          };
        };
        general: {
          title: string;
          watermark: {
            title: string;
            visible: string;
            text: string;
            enableUserName: string;
            enableTime: string;
            timeFormat: string;
          };
          multilingual: {
            title: string;
            visible: string;
          };
          globalSearch: {
            title: string;
            visible: string;
          };
        };
        configOperation: {
          copyConfig: string;
          copySuccessMsg: string;
          resetConfig: string;
          resetSuccessMsg: string;
        };
        tablePropsTitle: string;
        table: {
          size: { title: string } & Record<UnionKey.ThemeTableSize, string>;
          bordered: string;
          bottomBordered: string;
          singleColumn: string;
          singleLine: string;
          striped: string;
        };
      };
      route: Record<I18nRouteKey, string>;
      dict: Record<string, Record<string, string>>;
      page: {
        common: {
          id: string;
          createBy: string;
          createTime: string;
          updateBy: string;
          updateTime: string;
          remark: string;
          form: {
            remark: FormMsg;
          };
          pointForm: {
            name: string;
            key: string;
            dataType: string;
            unit: string;
            defaultValue: string;
            scale: string;
            energyType: string;
            sourceDataType: string;
            enumSourceDataType: string;
            enumMapping: string;
            pointDesc: string;
            enumValue: string;
            mappingName: string;
            mappingLabel: string;
            form: {
              name: FormMsg;
              key: FormMsg;
              dataType: FormMsg;
              unit: FormMsg;
              defaultValue: FormMsg;
              scale: FormMsg;
              energyType: FormMsg;
              sourceDataType: FormMsg;
              mappingValue: FormMsg;
              mappingName: FormMsg;
              enumSourceDataType: FormMsg;
              pointDesc: FormMsg;
            };
            options: {
              unitGroups: {
                temperature: string;
                humidity: string;
                pressure: string;
                electrical: string;
                powerEnergy: string;
                resistance: string;
                flow: string;
                volume: string;
                length: string;
                velocity: string;
                frequency: string;
                time: string;
                mass: string;
                light: string;
                concentration: string;
                energy: string;
                acousticsWater: string;
                general: string;
              };
              units: Record<string, string>;
              enumSourceNumber: string;
              enumSourceString: string;
              precisionNone: string;
              precision1: string;
              precision2: string;
              precision3: string;
              energyNone: string;
              energyElectricity: string;
              energyWater: string;
              energyGas: string;
              energyCooling: string;
              energyHeating: string;
              energyRuntime: string;
            };
            message: {
              enumMappingRequired: string;
            };
          };
        };
        corp: {
          common: {
            name: string;
            address: string;
            region: string;
            location: string;
            detailAddress: string;
            contact: string;
            contactPhone: string;
            email: string;
            password: string;
            confirmPassword: string;
            status: string;
            useStatus: string;
            auditStatus: string;
            view: string;
            audit: string;
            pass: string;
            reject: string;
            back: string;
            enable: string;
            disable: string;
            auditing: string;
            approved: string;
            rejected: string;
            addCorp: string;
            form: {
              name: FormMsg;
              region: FormMsg;
              detailAddress: FormMsg;
              contact: FormMsg;
              contactPhone: FormMsg;
              password: FormMsg;
            };
            placeholder: {
              companyName: string;
              email: string;
              password: string;
            };
            message: {
              nameMax: string;
              addressMax: string;
              confirmStatus: string;
              statusUpdateSuccess: string;
              auditPassSuccess: string;
              auditRejectSuccess: string;
              missingCorpId: string;
              emptyCorpDetail: string;
            };
          };
          list: {
            title: string;
          };
          detail: {
            title: string;
            versionData: string;
          };
          version: {
            title: string;
            name: string;
            versionName: string;
            versionDesc: string;
            corp: string;
            using: string;
            unassigned: string;
            startTime: string;
            endTime: string;
            expectedStartTime: string;
            addVersion: string;
            editVersion: string;
            addExistingVersion: string;
            benefitView: string;
            renewal: string;
            renewalDuration: string;
            priceConfig: string;
            priceBenefit: string;
            originalPrice: string;
            discountPrice: string;
            duration: string;
            resourceConfig: string;
            deviceCount: string;
            userCount: string;
            dailyMessageCount: string;
            dataStore: string;
            dataStoreDuration: string;
            menuConfig: string;
            menuPermission: string;
            benefitSummary: string;
            menuBenefit: string;
            allBenefit: string;
            day: string;
            month: string;
            year: string;
            calendarDay: string;
            dayDurationUnit: string;
            monthDurationUnit: string;
            yearDurationUnit: string;
            deviceUnit: string;
            userUnit: string;
            messageUnit: string;
            countWithUnit: string;
            dailyMessageBenefit: string;
            dataStoreBenefit: string;
            priceDurationBenefit: string;
            menuId: string;
            selectedAddVersions: string;
            selectVersion: string;
            emptyBenefitSummary: string;
            emptyMenuBenefit: string;
            emptyAllBenefit: string;
            emptyBenefitData: string;
            legacy: {
              gatewayManagement: string;
              energyScreen: string;
              meterSetting: string;
              energyPriceManagement: string;
              energyCategory: string;
            };
            form: {
              versionName: FormMsg;
              versionDesc: FormMsg;
              corp: FormMsg;
              expectedStartTime: FormMsg;
              originalPrice: FormMsg;
              discountPrice: FormMsg;
              duration: FormMsg;
              deviceCount: FormMsg;
              userCount: FormMsg;
              dailyMessageCount: FormMsg;
              dataStoreDuration: FormMsg;
              renewalDuration: FormMsg;
            };
            message: {
              versionNameMax: string;
              selectMenuRequired: string;
              renewalSuccess: string;
            };
          };
        };
        project: {
          list: {
            title: string;
            projectName: string;
            key: string;
            address: string;
            leader: string;
            contactPhone: string;
            version: string;
            projectVersion: string;
            projectStatus: string;
            view: string;
            member: string;
            memberName: string;
            phoneNumber: string;
            addProject: string;
            editProject: string;
            versionViewTitle: string;
            memberTitle: string;
            memberTitleWithName: string;
            currentVersion: string;
            priceTime: string;
            versionMenu: string;
            platformPassword: string;
            projectDesc: string;
            leaderPhone: string;
            enabled: string;
            disabled: string;
            form: {
              projectName: FormMsg;
              key: FormMsg;
              region: FormMsg;
              address: FormMsg;
              version: FormMsg;
              leader: FormMsg;
              contactPhone: FormMsg;
              platformPassword: FormMsg;
            };
            placeholder: {
              projectName: string;
              key: string;
              region: string;
              address: string;
              version: string;
              leader: string;
              leaderPhone: string;
              password: string;
              confirmPassword: string;
              projectDesc: string;
              memberName: string;
            };
            message: {
              projectNameMax: string;
              projectKeyPattern: string;
              addressMax: string;
              existingLeaderPhone: string;
              statusUpdateSuccess: string;
              unboundVersion: string;
              emptyVersionMenu: string;
              emptyVersionData: string;
            };
          };
        };
        global: {
          industry: {
            title: string;
            name: string;
            sort: string;
            desc: string;
            createTime: string;
            addIndustry: string;
            editIndustry: string;
            form: {
              name: FormMsg;
              sort: FormMsg;
              desc: FormMsg;
            };
          };
          sysScreen: {
            title: string;
            name: string;
            cover: string;
            status: string;
            createTime: string;
            routePath: string;
            routeName: string;
            componentPath: string;
            industryType: string;
            projectConfig: string;
            project: string;
            mockData: string;
            visual3d: string;
            personalInfo: string;
            enterSystem: string;
            logout: string;
            thumbnail: string;
            addSysScreen: string;
            editSysScreen: string;
            addProject: string;
            form: {
              name: FormMsg;
              routePath: FormMsg;
              componentPath: FormMsg;
              thumbnail: FormMsg;
              industryType: FormMsg;
              status: FormMsg;
              project: FormMsg;
            };
            message: {
              projectConfigRequired: string;
              projectRequired: string;
            };
            placeholder: {
              routePathExample: string;
              routeNameExample: string;
              componentPathExample: string;
            };
          };
          activate: {
            title: string;
            eyebrow: string;
            description: string;
            required: string;
            licenseType: string;
            expireTime: string;
            strategySpecified: string;
            strategySpecifiedDesc: string;
            strategyPermanent: string;
            strategyPermanentDesc: string;
            stepSelectType: string;
            stepSetExpireTime: string;
            stepGenerate: string;
            stepResult: string;
            resetForm: string;
            generate: string;
            copyLicense: string;
            permanentDatePlaceholder: string;
            datePlaceholder: string;
            previewPermanent: string;
            previewPending: string;
            previewSpecified: string;
            form: {
              licenseType: FormMsg;
              expireTime: FormMsg;
            };
            message: {
              clipboardUnsupported: string;
              copyFailed: string;
              copySuccess: string;
              generateSuccess: string;
            };
          };
          deviceTypeTemplate: {
            title: string;
            categoryTitle: string;
            emptyCategory: string;
            name: string;
            key: string;
            typeKey: string;
            icon: string;
            status: string;
            desc: string;
            sort: string;
            categoryName: string;
            parentCategory: string;
            updateTime: string;
            pointManagement: string;
            addDeviceType: string;
            editDeviceType: string;
            addCategory: string;
            editCategory: string;
            enable: string;
            disable: string;
            form: {
              parentCategory: FormMsg;
              name: FormMsg;
              typeKey: FormMsg;
              status: FormMsg;
              categoryName: FormMsg;
              sort: FormMsg;
              desc: FormMsg;
            };
            placeholder: {
              typeKey: string;
            };
            message: {
              selectCategory: string;
            };
          };
          deviceTypeTemplatePoint: {
            title: string;
            pointName: string;
            pointKey: string;
            dataType: string;
            desc: string;
            updateTime: string;
            keyword: string;
            addPoint: string;
            editPoint: string;
            form: {
              keyword: FormMsg;
            };
            message: {
              missingTemplateId: string;
              missingPointId: string;
            };
          };
        };
        login: {
          common: {
            title: string;
            subTitle: string;
            loginOrRegister: string;
            register: string;
            userNamePlaceholder: string;
            phonePlaceholder: string;
            codePlaceholder: string;
            passwordPlaceholder: string;
            confirmPasswordPlaceholder: string;
            sendCodeDesc: string;
            codeLogin: string;
            confirm: string;
            back: string;
            submit: string;
            validateSuccess: string;
            loginSuccess: string;
            welcomeBack: string;
            retryAfter: string;
            noCaptcha: string;
            noAccount: string;
            applyCorpEntry: string;
          };
          pwdLogin: {
            title: string;
            accountTitle: string;
            accountSubtitle: string;
            rememberMe: string;
            forgetPassword: string;
            register: string;
            otherLoginMode: string;
            selectCorpTitle: string;
            selectCorpSubtitle: string;
            searchCorpPlaceholder: string;
            emptyCorp: string;
            selectProjectTitle: string;
            selectProjectSubtitle: string;
            searchProjectPlaceholder: string;
            emptyProject: string;
            projectId: string;
            superAdmin: string;
            admin: string;
            user: string;
          };
          codeLogin: {
            title: string;
            getCode: string;
            reGetCode: string;
            sendCodeSuccess: string;
            imageCodePlaceholder: string;
          };
          register: {
            title: string;
            subTitle: string;
            query: string;
            agreement: string;
            protocol: string;
            policy: string;
            projectChecked: string;
            projectNotFound: string;
            projectNamePlaceholder: string;
            userNamePlaceholder: string;
            phoneExists: string;
            registerSuccess: string;
            form: {
              projectName: FormMsg;
              userName: FormMsg;
            };
          };
          resetPwd: {
            title: string;
            resetSuccess: string;
            codePattern: string;
          };
          applyCorp: {
            title: string;
            subTitle: string;
            submitSuccess: string;
            nameMax: string;
            addressMax: string;
            phoneExists: string;
            form: {
              name: FormMsg;
              region: FormMsg;
              address: FormMsg;
              contactName: FormMsg;
              contactPhone: FormMsg;
              password: FormMsg;
            };
            placeholder: {
              name: string;
              region: string;
              address: string;
              contactName: string;
              contactPhone: string;
              password: string;
              confirmPassword: string;
              email: string;
            };
          };
          selectList: {
            ariaEnter: string;
            backLogin: string;
          };
          bindWeChat: {
            title: string;
          };
        };
        home: {
          branchDesc: string;
          greeting: string;
          weatherDesc: string;
          projectCount: string;
          todo: string;
          message: string;
          areaCount: string;
          registerCount: string;
          schedule: string;
          study: string;
          work: string;
          rest: string;
          entertainment: string;
          integratorCount: string;
          userCount: string;
          dealCount: string;
          projectNews: {
            title: string;
            moreNews: string;
            desc1: string;
            desc2: string;
            desc3: string;
            desc4: string;
            desc5: string;
          };
          creativity: string;
        };
        userCenter: {
          personalInfo: string;
          basicInfo: string;
          updatePassword: string;
          projectLogo: string;
          username: string;
          phoneNumber: string;
          dept: string;
          role: string;
          email: string;
          gender: string;
          oldPassword: string;
          newPassword: string;
          confirmPassword: string;
          editAvatar: string;
          editProjectLogo: string;
          selectImage: string;
          confirmCrop: string;
          form: {
            username: FormMsg;
            role: FormMsg;
            oldPassword: FormMsg;
            newPassword: FormMsg;
            confirmPassword: FormMsg;
          };
          placeholder: {
            nickname: string;
            phone: string;
            dept: string;
            role: string;
            email: string;
            oldPassword: string;
            newPassword: string;
            confirmPassword: string;
          };
          message: {
            profileUpdateSuccess: string;
            passwordMismatch: string;
            passwordUpdateSuccess: string;
            imageTypeRequired: string;
            avatarUpdateSuccess: string;
            projectLogoUpdateSuccess: string;
          };
        };
        system: {
          client: {
            title: string;
            clientId: string;
            clientKey: string;
            clientSecret: string;
            grantTypeList: string;
            deviceType: string;
            activeTimeout: string;
            timeout: string;
            status: string;
            form: {
              clientId: FormMsg;
              clientKey: FormMsg;
              clientSecret: FormMsg;
              grantTypeList: FormMsg;
              deviceType: FormMsg;
              activeTimeout: FormMsg;
              timeout: FormMsg;
              status: FormMsg;
            };
            addClient: string;
            editClient: string;
          };
          config: {
            title: string;
            configName: string;
            configKey: string;
            configValue: string;
            configType: string;
            remark: string;
            createTime: string;
            refreshCache: string;
            refreshCacheSuccess: string;
            form: {
              configId: FormMsg;
              configName: FormMsg;
              configKey: FormMsg;
              configValue: FormMsg;
              configType: FormMsg;
              remark: FormMsg;
            };
            addConfig: string;
            editConfig: string;
          };
          dept: {
            empty: string;
            title: string;
            parentId: string;
            name: string;
            sort: string;
            leader: string;
            createTime: string;
            expandAll: string;
            collapseAll: string;
            form: {
              parentId: FormMsg;
              name: FormMsg;
              leader: FormMsg;
              sort: FormMsg;
            };
            error: {
              getDeptDataFail: string;
              getDeptUserDataFail: string;
            };
            placeholder: {
              defaultLeaderPlaceHolder: string;
              addDataLeaderPlaceHolder: string;
              deptUserIsEmptyLeaderPlaceHolder: string;
            };
            addDept: string;
            editDept: string;
          };
          dict: {
            title: string;
            dictTypeTitle: string;
            dictName: string;
            dictType: string;
            status: string;
            remark: string;
            createTime: string;
            refreshCacheSuccess: string;
            refreshCache: string;
            confirmDeleteDictType: string;
            data: {
              title: string;
              label: string;
              value: string;
              dictSort: string;
              isDefault: string;
              listClass: string;
              cssClass: string;
              status: string;
              remark: string;
              createTime: string;
            };
            form: {
              dictId: FormMsg;
              dictCode: FormMsg;
              dictName: FormMsg;
              dictType: FormMsg;
              status: FormMsg;
              remark: FormMsg;
              dictLabel: FormMsg;
              dictValue: FormMsg;
              dictSort: FormMsg;
              isDefault: FormMsg;
              listClass: FormMsg;
              cssClass: FormMsg;
            };
            addDict: string;
            editDict: string;
            addDictData: string;
            editDictData: string;
            addDictType: string;
            editDictType: string;
            exportDictType: string;
            refreshDictType: string;
            dictTypeIsEmpty: string;
          };
          menu: {
            title: string;
            parentId: string;
            menuName: string;
            buttonName: string;
            icon: string;
            orderNum: string;
            perms: string;
            permission: string;
            component: string;
            path: string;
            routeName: string;
            layout: string;
            defaultLayout: string;
            blankLayout: string;
            externalPath: string;
            extLink: string;
            iframe: string;
            query: string;
            iframeQuery: string;
            isFrame: string;
            isCache: string;
            menuType: string;
            visible: string;
            status: string;
            createTime: string;
            cache: string;
            noCache: string;
            rootName: string;
            buttonPermissionList: string;
            emptyMenu: string;
            menuDetail: string;
            cascadeDeleteContent: string;
            expandCollapse: string;
            selectDeselectAll: string;
            parentChildCascade: string;
            isFrameTip: string;
            isCacheTip: string;
            visibleTip: string;
            statusTip: string;
            permsTip: string;
            componentTip: string;
            pathTip: string;
            layoutTip: string;
            form: {
              parentId: FormMsg;
              menuType: FormMsg;
              menuIds: FormMsg;
              icon: FormMsg;
              menuName: FormMsg;
              orderNum: FormMsg;
              perms: FormMsg;
              isFrame: FormMsg;
              path: FormMsg;
              routeName: FormMsg;
              component: FormMsg;
              query: FormMsg;
              isCache: FormMsg;
              visible: FormMsg;
              status: FormMsg;
              permission: FormMsg;
            };
            placeholder: {
              queryKey: string;
              queryValue: string;
              queryIframe: string;
            };
            directory: string;
            menu: string;
            button: string;
            addMenu: string;
            addChildMenu: string;
            editMenu: string;
            cascadeDelete: string;
          };
          notice: {
            title: string;
            noticeTitle: string;
            noticeType: string;
            noticeContent: string;
            status: string;
            createTime: string;
            form: {
              noticeTitle: FormMsg;
              noticeType: FormMsg;
              noticeContent: FormMsg;
              status: FormMsg;
            };
            addNotice: string;
            editNotice: string;
          };
          oss: {
            title: string;
            fileName: string;
            originalName: string;
            fileSuffix: string;
            url: string;
            createTime: string;
            service: string;
            form: {
              file: FormMsg;
            };
            upload: string;
            preview: string;
            download: string;
            copy: string;
            copySuccess: string;
          };
          ossConfig: {
            title: string;
            configKey: string;
            accessKey: string;
            secretKey: string;
            bucketName: string;
            prefix: string;
            endpoint: string;
            domain: string;
            isHttps: string;
            region: string;
            status: string;
            remark: string;
            createTime: string;
            form: {
              configKey: FormMsg;
              accessKey: FormMsg;
              secretKey: FormMsg;
              bucketName: FormMsg;
              prefix: FormMsg;
              endpoint: FormMsg;
              domain: FormMsg;
              isHttps: FormMsg;
              region: FormMsg;
              status: FormMsg;
              remark: FormMsg;
            };
            addOssConfig: string;
            editOssConfig: string;
          };
          post: {
            title: string;
            postCode: string;
            postName: string;
            postSort: string;
            status: string;
            remark: string;
            createTime: string;
            form: {
              postCode: FormMsg;
              postName: FormMsg;
              postSort: FormMsg;
              status: FormMsg;
              remark: FormMsg;
            };
            addPost: string;
            editPost: string;
          };
          role: {
            title: string;
            roleName: string;
            roleKey: string;
            roleSort: string;
            roleType: string;
            desc: string;
            status: string;
            remark: string;
            menuPermission: string;
            dataScope: string;
            dataScopeRange: string;
            visualPermission: string;
            createTime: string;
            roleTypes: {
              systemAdmin: string;
              normalMember: string;
            };
            dataScopes: {
              all: string;
              self: string;
              dept: string;
              deptAndSub: string;
            };
            form: {
              roleName: FormMsg;
              roleKey: FormMsg;
              roleSort: FormMsg;
              status: FormMsg;
              remark: FormMsg;
              desc: FormMsg;
              menuIds: FormMsg;
              deptIds: FormMsg;
            };
            addRole: string;
            editRole: string;
            configPermission: string;
            authorizedUsers: string;
            selectMenuPermission: string;
            selectDataScope: string;
            selectDeptPermission: string;
            permissionConfig: string;
            permissionConfigWithName: string;
            visualTypes: {
              systemScreen: string;
              configuration: string;
              customScreen: string;
            };
            searchScreenName: string;
            searchConfigurationName: string;
            permissionAll: string;
            controlAll: string;
            visualPermissionStats: string;
            noScreen: string;
            noThumbnail: string;
            permission: string;
            control: string;
          };
          tenant: {
            title: string;
            tenantName: string;
            tenantId: string;
            contactUserName: string;
            contactPhone: string;
            companyName: string;
            licenseNumber: string;
            address: string;
            intro: string;
            domain: string;
            packageId: string;
            expireTime: string;
            accountCount: string;
            status: string;
            createTime: string;
            form: {
              tenantName: FormMsg;
              contactUserName: FormMsg;
              contactPhone: FormMsg;
              companyName: FormMsg;
              licenseNumber: FormMsg;
              address: FormMsg;
              intro: FormMsg;
              domain: FormMsg;
              packageId: FormMsg;
              expireTime: FormMsg;
              accountCount: FormMsg;
              status: FormMsg;
            };
            addTenant: string;
            editTenant: string;
          };
          tenantPackage: {
            title: string;
            packageName: string;
            menuIds: string;
            remark: string;
            status: string;
            createTime: string;
            form: {
              packageName: FormMsg;
              menuIds: FormMsg;
              status: FormMsg;
              remark: FormMsg;
            };
            addTenantPackage: string;
            editTenantPackage: string;
            statusChangeSuccess: string;
          };
          user: {
            title: string;
            userName: string;
            nickName: string;
            deptName: string;
            roleName: string;
            phonenumber: string;
            status: string;
            createTime: string;
            password: string;
            confirmPassword: string;
            sex: string;
            roleIds: string;
            postIds: string;
            email: string;
            expiredAt: string;
            expiredAtPlaceholder: string;
            avatar: string;
            remark: string;
            form: {
              userName: FormMsg;
              nickName: FormMsg;
              deptId: FormMsg;
              phonenumber: FormMsg;
              status: FormMsg;
              password: FormMsg;
              confirmPassword: FormMsg;
              sex: FormMsg;
              roleIds: FormMsg;
              postIds: FormMsg;
              email: FormMsg;
              remark: FormMsg;
            };
            addUser: string;
            editUser: string;
            resetPassword: string;
            resetPasswordConfirmTitle: string;
            resetPasswordConfirmButton: string;
            resetPasswordConfirmPrefix: string;
            resetPasswordConfirmSuffix: string;
            resetPasswordSuccess: string;
            importUsers: string;
            exportTemplate: string;
            importSuccess: string;
            statusChangeSuccess: string;
          };
        };
        about: {
          title: string;
          introduction: string;
          projectInfo: {
            title: string;
            version: string;
            latestBuildTime: string;
            documentLink: string;
            previewLink: string;
            repositoryLink: string;
          };
          prdDep: string;
          devDep: string;
        };
      };
      form: {
        required: string;
        userName: FormMsg;
        phone: FormMsg;
        pwd: FormMsg;
        confirmPwd: FormMsg;
        code: FormMsg;
        email: FormMsg;
      };
      dropdown: Record<Global.DropdownKey, string>;
      icon: {
        themeConfig: string;
        themeSchema: string;
        lang: string;
        fullscreen: string;
        fullscreenExit: string;
        reload: string;
        collapse: string;
        expand: string;
        pin: string;
        unpin: string;
        manual: string;
      };
      datatable: {
        itemCount: string;
        fixed: {
          left: string;
          right: string;
          unFixed: string;
        };
      };
    };

    type GetI18nKey<T extends Record<string, unknown>, K extends keyof T = keyof T> = K extends string
      ? T[K] extends Record<string, unknown>
        ? `${K}.${GetI18nKey<T[K]>}`
        : K
      : never;

    type I18nKey = GetI18nKey<Schema>;

    type TranslateOptions<Locales extends string> = import('vue-i18n').TranslateOptions<Locales>;

    interface $T {
      (key: I18nKey): string;
      (key: I18nKey, plural: number, options?: TranslateOptions<LangType>): string;
      (key: I18nKey, defaultMsg: string, options?: TranslateOptions<I18nKey>): string;
      (key: I18nKey, list: unknown[], options?: TranslateOptions<I18nKey>): string;
      (key: I18nKey, list: unknown[], plural: number): string;
      (key: I18nKey, list: unknown[], defaultMsg: string): string;
      (key: I18nKey, named: Record<string, unknown>, options?: TranslateOptions<LangType>): string;
      (key: I18nKey, named: Record<string, unknown>, plural: number): string;
      (key: I18nKey, named: Record<string, unknown>, defaultMsg: string): string;
    }
  }

  /** Service namespace */
  namespace Service {
    /** Other baseURL key */
    type OtherBaseURLKey = 'demo';

    interface ServiceConfigItem {
      /** The backend service base url */
      baseURL: string;
      /** The proxy pattern of the backend service base url */
      proxyPattern: string;
      ws?: boolean;
    }

    interface OtherServiceConfigItem extends ServiceConfigItem {
      key: OtherBaseURLKey;
    }

    /** The backend service config */
    interface ServiceConfig extends ServiceConfigItem {
      /** Other backend service config */
      other: OtherServiceConfigItem[];
    }

    interface SimpleServiceConfig extends Pick<ServiceConfigItem, 'baseURL'> {
      other: Record<OtherBaseURLKey, string>;
    }

    /** The backend service response data */
    type Response<T = unknown> = {
      /** The backend service response code */
      code: string;
      /** The backend service response message */
      msg: string;
      /** The backend service response detail */
      detail?: string;
      /** The backend service response data */
      data: T;
    };

    /** The demo backend service response data */
    type DemoResponse<T = unknown> = {
      /** The backend service response code */
      status: string;
      /** The backend service response message */
      message: string;
      /** The backend service response data */
      result: T;
    };
  }
}
