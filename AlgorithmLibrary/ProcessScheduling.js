/**
 * Created by AK4TRL on 2017/6/13.
 * ProcessScheduling
 */
var curProcessScheduling;

var ProcessScheduling = function (am, w, h) {
    this.init(am, w, h);
}

function init() {
    var animManag = initCanvas();
    curProcessScheduling = new ProcessScheduling(animManag, canvas.width, canvas.height);
}

//自定义排序
function by(name, minor) {
    //
    return function(o, p){
        var a, b;
        a = o[name];
        b = p[name];
        if(a === b){
            return typeof minor === 'function' ? minor(o, p) : 0;
        }
        if(typeof a === typeof b){
            return a < b ? -1 : 1;
        }
        return typeof a < typeof b ? -1 : 1;
    }
}
function des(name, minor) {
    //
    return function(o, p){
        var a, b;
        a = o[name];
        b = p[name];
        if(a === b){
            return typeof minor === 'function' ? minor(o, p) : 0;
        }
        if(typeof a === typeof b){
            return a > b ? -1 : 1;
        }
        return typeof a > typeof b ? -1 : 1;
    }
}
function CmpByServerTime(property){
    return function(a, b){
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}
function CmpByLevel(array, key) {
    return array.sort(function(a, b) { return b[key] - a[key];});
}

var ARRAY_SIZE_SMALL = 10;
var ARRAY_WIDTH_SMALL = 140;
var ARRAY_BAR_WIDTH_SMALL = 140;
var ARRAY_HEIGHT_SMALL = 50;
var ARRAY_INITIAL_X_SMALL = 100;

var ARRAY_Y_POS = 100;
var ARRAY_LABEL_Y_POS = 125;

var LOWER_ARRAY_Y_POS = 500;
var LOWER_ARRAY_LABEL_Y_POS = 510;

var SCALE_FACTOR = 2.0;

var BAR_FOREGROUND_COLOR = "#000";
var BAR_BACKGROUND_COLOR ="#FFF";
var INDEX_COLOR = "#000";
var HIGHLIGHT_BAR_COLOR = "#FF0000";
var HIGHLIGHT_BAR_BACKGROUND_COLOR = "#FFAAAA";

var Process = [];
//ProcessScheduling继承算法基类与其本身构造
ProcessScheduling.prototype = new Algorithm();
ProcessScheduling.prototype.constructor = ProcessScheduling;
ProcessScheduling.superclass = Algorithm.prototype;
ProcessScheduling.prototype.init = function (am, w, h) {
    ProcessScheduling.superclass.init.call(this,am);
    this.theStaus = 0;
    this.addControls();
    this.nextIndex = 0;
    this.setArraySize();
    this.readyTime = new Array(10);
    this.processNameIndex = new Array(100);
    this.ServerTime = new Array(10);
    this.priority = new Array(10);

    //create random visual objects
    this.createVisualObjects();
}
//创建表格和label组件
ProcessScheduling.prototype.createVisualObjects = function(){
    this.barObjects = new Array(this.array_size);
    this.oldBarObjects= new Array(this.array_size);
    this.oldbarLabels= new Array(this.array_size);

    this.barLabels = new Array(this.array_size);
    this.barPositionsY = new Array(this.array_size);
    this.oldData = new Array(this.array_size);
    this.obscureObject  = new Array(this.array_size);

    var xPos = this.array_initial_x;
    var yPos = this.array_y_pos;
    var yLabelPos = this.array_label_y_pos;

    this.commands = new Array();
    //console.log(this.array_size);
    var labelCount = 0;
    for(var i = 0; i < 8; ++i) {
        this.cmd("CreateGrid", this.nextIndex++, "", this.array_bar_width, 36, this.array_width * (i + 1), yPos - 19, "center", "center");
        this.cmd("CreateLabel", this.nextIndex, "", this.array_width * (i + 1), yPos - 20);
        this.barLabels[labelCount++] = this.nextIndex++;
    }

    //Create a cmd to give to the animation manager
    for (var i = 0; i < this.array_size; i++)
    {

        //xPos = xPos + this.array_width;
        xPos = this.array_width;
        yPos = yPos + this.array_height;
        //console.log("ps of yLabelPos:" + yLabelPos);
        this.barPositionsY[i] = yPos;
        this.processNameIndex[i] = this.nextIndex;
        //console.log("the process's name id:" + this.processNameIndex[i]);
        //console.log(this.processNameIndex);
        for(var j = 0; j < 8; ++j) {
            this.cmd("CreateGrid", this.nextIndex, "", this.array_bar_width, 50, xPos, yPos, "center", "bottom");
            //this.cmd("CreateRectangle", this.nextIndex, "", this.array_bar_width, 200, xPos, yPos,"center","bottom");
            this.cmd("SetForegroundColor", this.nextIndex, BAR_FOREGROUND_COLOR);
            this.cmd("SetBackgroundColor", this.nextIndex, BAR_BACKGROUND_COLOR);
            this.barObjects[i] = this.nextIndex;
            //this.oldBarObjects[i] = this.barObjects[i];
            this.nextIndex += 1;
            if (this.showLabels) {
                //console.log("1");
                this.cmd("CreateLabel", this.nextIndex, "99", xPos, yLabelPos);
            }
            else {
                this.cmd("CreateLabel", this.nextIndex, "0", xPos, yLabelPos);
            }
            this.cmd("SetForegroundColor", this.nextIndex, INDEX_COLOR);
            //console.log("the barlabels's id :" + this.nextIndex);
            this.barLabels[labelCount++] = this.nextIndex;
            xPos += this.array_width;
            //this.oldbarLabels[i] = this.barLabels[labelCount++];
            ++this.nextIndex;
        }

        yLabelPos += 50;
    }
    this.theStaus = this.nextIndex;
    this.cmd("CreateLabel", this.theStaus, " ", 35, 688,0);
    var MainText = "\u8bf7\u4ece\u4e0a\u9762\u8fdb\u884c\u8981\u8fdb\u884c\u7684\u7c7b\u578b\u3002";
    MainText = reconvert(MainText);
    this.cmd("SetText", this.theStaus, MainText);

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.randomizeArray();

    for (i = 0; i < this.array_size; i++)
    {
        this.obscureObject[i] = false;
    }
    this.lastCreatedIndex = this.nextIndex;
}

//初始化控件
ProcessScheduling.prototype.addControls = function () {

    //返回主页
    var task1 = "\u8fd4\u56de";
    task1 = reconvert(task1);
    this.returnButton = addControlToAlgorithmBar("Button", task1);
    this.returnButton.onclick = this.returnCallback.bind(this);

    //先到先服务算法（FCFS）
    var task2 = "\u5148\u5230\u5148\u670d\u52a1\u7b97\u6cd5";
    task2 = reconvert(task2);
    this.fcfsButton = addControlToAlgorithmBar("Button", task2);
    this.fcfsButton.onclick = this.fcfsCallback.bind(this);

    //短作业优先算法（SJF）
    var task3 = "\u77ed\u4f5c\u4e1a\u4f18\u5148\u7b97\u6cd5";
    task3 = reconvert(task3);
    this.sjfButton = addControlToAlgorithmBar("Button",task3);
    this.sjfButton.onclick = this.sjfCallback.bind(this);

    //优先级调度算法（PSA）
    var task4 = "\u4f18\u5148\u7ea7\u8c03\u5ea6\u7b97\u6cd5";
    task4 = reconvert(task4);
    this.psaButton = addControlToAlgorithmBar("Button",task4);
    this.psaButton.onclick = this.psaCallback.bind(this);

    //高响应比优先调度算法（HRRN）
    var task5 = "\u9ad8\u54cd\u5e94\u6bd4\u4f18\u5148\u8c03\u5ea6\u7b97\u6cd5";
    task5 = reconvert(task5);
    this.hrrnButton = addControlToAlgorithmBar("Button",task5);
    this.hrrnButton.onclick = this.hrrnCallback.bind(this);

    //轮转调度算法（RR）
    var task6 = "\u65f6\u95f4\u7247\u8f6e\u8f6c\u8c03\u5ea6\u7b97\u6cd5";
    task6 = reconvert(task6);
    this.rrButton = addControlToAlgorithmBar("Button",task6);
    this.rrButton.onclick = this.rrCallback.bind(this);
}

//回调函数
ProcessScheduling.prototype.returnCallback = function (option) {
    window.location.href = "index.html";
}

//**
//////////////////////////////////////////////////////////////////////FCFS-start//////////////////////////////////////////////////////////////////////
//FCFS callback 先来先服务
ProcessScheduling.prototype.fcfsCallback = function (option) {
    Process = [];
    this.randomizeArray(1);

    var task1 = "\u5148\u6765\u5148\u670d\u52a1\u7b97\u6cd5\u5f00\u59cb";
    task1 = reconvert(task1);
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 9) {
        this.fcfsStartButton = addControlToAnimationBar("Button", task1);
        this.fcfsStartButton.onclick = this.fcfsStartButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.fcfsStartButton = addControlToAnimationBar("Button", task1);
        this.fcfsStartButton.onclick = this.fcfsStartButtonCallback.bind(this);
    }
    var description = "\u5148\u6765\u5148\u670d\u52a1\u8c03\u5ea6\u7b97\u6cd5\uff08\u0046\u0069\u0072\u0073\u0074\u0020\u0043\u006f\u006d\u0065\u0020\u0046\u0069\u0072\u0073\u0074\u0020\u0053\u0065\u0072\u0076\u0065\uff09\u662f" +
        "\u4e00\u79cd\u6700\u7b80\u5355\u7684\u65b9\u6cd5\uff0c\u7cfb\u7edf\u7ef4\u62a4" +
        "\u4e00\u4e2a\u0046\u0049\u0046\u004f\u961f\u5217\uff0c\u6309\u7167\u8fdb\u7a0b" +
        "\u5230\u8fbe\u5c31\u7eea\u961f\u5217\u7684\u5148\u540e\u6b21\u5e8f\u987a\u5e8f" +
        "\u8c03\u5ea6\u8fd0\u884c\u3002";
    description = reconvert(description);
    var p = "\u2460\u002e\u6309\u5347\u5e8f\u6392\u5217\u5c31\u7eea\u65f6\u95f4\u0020\u2461\u002e\u540e\u6765\u7684\u6309\u5230\u8fbe\u65f6\u95f4\u7684\u5148\u540e\u6392\u5728\u5c31\u7eea\u961f\u5217\u4e0a\uff0c\u6bcf\u6b21\u53d6\u961f\u9996\u5143\u7d20\u8fd0\u884c\u3002";
    p = reconvert(p);
    addLabelToAlgorithmBar(description);
    addLabelToAlgorithmBar(p);

    return this.commands;
}
ProcessScheduling.prototype.fcfsStartButtonCallback = function (option) {
    this.implementAction(this.fcfs.bind(this), 0);
}
//先来先服务算法实现过程
ProcessScheduling.prototype.fcfs = function(value) {

    //this.point=value;    //后移的指针
    this.animationManager.clearHistory();
    this.commands = new Array();
    var tmpProcess;

    //先排序
    //
    Process.sort(by('readyTime',by('ServerTime')));
    this.recordProcess = new Array();
    this.recordProcess = Process.slice(0, Process.length);
    var FinishTime = -1;                                //上一个作业的完成时间

    for (var i = 0; i < this.recordProcess.length; ++i) {
        if (this.recordProcess[i].readyTime < FinishTime){ //没有作业正在运行，取队首作业运行
            this.recordProcess[i].FinishTime = this.recordProcess[i - 1].FinishTime + this.recordProcess[i].ServerTime;
        }
        else                                  //有作业正在运行，等待作业完毕，此作业再运行
            this.recordProcess[i].FinishTime = this.recordProcess[i].readyTime + this.recordProcess[i].ServerTime;

        this.recordProcess[i].TurnoverTime = this.recordProcess[i].FinishTime - this.recordProcess[i].readyTime;
        this.recordProcess[i].WeightedTurnoverTime = (this.recordProcess[i].TurnoverTime / this.recordProcess[i].ServerTime).toFixed(2);
        FinishTime = this.recordProcess[i].FinishTime;
    }
    tmpProcess = [0,1,2,3,4,5,6,7,8,9,10,11];
    for(var i = 0; i < this.recordProcess.length; ++i)
    {
        var p = "\u4ece\u5230\u8fbe\u7684\u8fdb\u7a0b\u627e\u5230\u6700\u5148\u5230\u8fbe\u7684\u4e00\u4e2a\uff0c\u4e0a\u4e00\u4e2a\u8fdb\u7a0b\u7ed3\u675f\u65f6\u523b\u4e3a";
        p = reconvert(p);
        var p2 = "\uff0c\u672c\u6b21\u6700\u5148\u5230\u8fbe\u65f6\u95f4\u4e3a";
        p2 = reconvert(p2);
        var tmpFinishTime;
        if(i == 0)
            tmpFinishTime = 0;
        else
            tmpFinishTime = this.recordProcess[i - 1].FinishTime
        this.cmd("SetText", this.theStaus, p + tmpFinishTime + p2 + this.recordProcess[i].readyTime);

        this.cmd("Step");

        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 2, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");

        //result flag
        var cResult = "\u8ba1\u7b97\u5f53\u524d\u8fdb\u7a0b\u7684\u5f00\u59cb\u65f6\u523b\u3001\u7ed3\u675f\u65f6\u523b\u548c\u5468\u8f6c\u65f6\u95f4\u7b49";
        cResult = reconvert(cResult);
        this.cmd("SetText", this.theStaus, cResult);

        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 2, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 4, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");
        //开始时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 4, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 8, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 9, this.recordProcess[i].FinishTime - this.recordProcess[i].ServerTime);
        this.cmd("Step");
        //结束时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 8, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 10, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 11, this.recordProcess[i].FinishTime);
        this.cmd("Step");
        //周转时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 10, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 13, this.recordProcess[i].TurnoverTime);
        this.cmd("Step");
        //带权周转时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 12, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 14, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 15, this.recordProcess[i].WeightedTurnoverTime);
        this.cmd("Step");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 14, "#fff");

        this.cmd("Step");
        var tmpFinishStaus = "\u5b8c\u6210\u3002";
        tmpFinishStaus = reconvert(tmpFinishStaus);
        this.cmd("SetText", this.theStaus, tmpFinishStaus);
        this.cmd("Step");
        var tmpExchange = "\u5c06\u5b8c\u6210\u540e\u7684\u8fdb\u7a0b\u4ea4\u6362\u5230\u524d\u9762\uff0c\u7136\u540e\u8fdb\u884c\u4e0b\u4e00\u4e2a\u3002";
        tmpExchange = reconvert(tmpExchange);
        this.cmd("SetText", this.theStaus, tmpExchange);
        this.cmd("Step");
        /*---依次移动到顶端----*/
        for(var j = 0; j <= 14; j += 2){
            this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + j, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        }

        for(var j = 0; j <= 14; j += 2) {
            this.cmd("Move", this.recordProcess[i].pid * 16 + j, this.array_width * (j / 2 + 1), this.barPositionsY[i]);
            this.cmd("Move", this.recordProcess[i].pid * 16 + 1 + j, this.array_width * (j / 2 + 1), this.barPositionsY[i] - 25);
        }

        var tmpIndex, tmp;
        for(var j = 1; j < 11; ++j){
            if(tmpProcess[j] == this.recordProcess[i].pid){
                tmpIndex = j;
                break;
            }
        }

        for(var j = 0; j <= 14; j += 2) {
            this.cmd("Move", (tmpProcess[i + 1]) * 16 + j, this.array_width * (j / 2 + 1), this.barPositionsY[tmpIndex - 1]);
            this.cmd("Move", (tmpProcess[i + 1]) * 16 + 1 + j, this.array_width *(j / 2 + 1), this.barPositionsY[tmpIndex - 1] - 25);
        }
        this.cmd("Step");

        tmp = tmpProcess[i + 1];
        tmpProcess[i + 1] = tmpProcess[tmpIndex];
        tmpProcess[tmpIndex] = tmp;
    }
    var tmpFinishStaus = "\u6240\u6709\u8fdb\u7a0b\u5747\u5df2\u5b8c\u6210\u3002";
    tmpFinishStaus = reconvert(tmpFinishStaus);
    this.cmd("SetText", this.theStaus, tmpFinishStaus);
    console.log(tmpProcess);
    console.log(this.recordProcess);
    this.cmd("Step");
    for(var i = 0; i < this.recordProcess.length; ++i)
    {
        for(var j = 0; j <= 14; j += 2)
        {
            this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + j, "#fff");
        }
    }

    return this.commands ;
}
//////////////////////////////////////////////////////////////////////FCFS-end//////////////////////////////////////////////////////////////////////
//***

//**
//////////////////////////////////////////////////////////////////////SJF-start//////////////////////////////////////////////////////////////////////
//SJF callback
ProcessScheduling.prototype.sjfCallback = function (option) {
    Process = [];
    this.animationManager.clearHistory();
    this.randomizeArray(2);

    var task2 = "\u77ed\u4f5c\u4e1a\u4f18\u5148\u7b97\u6cd5\u5f00\u59cb";
    task2 = reconvert(task2);
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 9) {
        this.sjfStartButton = addControlToAnimationBar("Button", task2);
        this.sjfStartButton.onclick = this.sjfStarttButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.sjfStartButton = addControlToAnimationBar("Button", task2);
        this.sjfStartButton.onclick = this.sjfStarttButtonCallback.bind(this);
    }
    var sjfdescription = "\u6700\u77ed\u4f5c\u4e1a\u4f18\u5148\u8c03\u5ea6\u6cd5\uff08\u0053\u0068\u006f\u0072\u0074\u0020\u004a\u006f\u0062\u0020\u0046\u0069\u0072\u0073\u0074\uff09\u8981\u6c42\u6bcf\u4e2a\u4f5c\u4e1a\u7684\u8fdb\u7a0b\u63d0\u4f9b\u6240\u9700\u7684\u8fd0\u884c\u65f6\u95f4\uff0c\u6bcf\u6b21\u8c03\u5ea6\u4e8b\u603b\u662f\u9009\u53d6\u8fd0\u884c\u65f6\u95f4\u6700\u77ed\u7684\u8fdb\u7a0b\u8fd0\u884c\u3002\u8fd9\u79cd\u7b97\u6cd5\u5bf9\u4e8e\u8fd0\u884c\u65f6\u95f4\u77ed\u7684\u8fdb\u7a0b\u6709\u5229\uff0c\u8fdb\u7a0b\u7684\u5e73\u5747\u7b49\u5f85\u548c\u5468\u8f6c\u65f6\u95f4\u6700\u4f73\u3002";
    sjfdescription = reconvert(sjfdescription);

    var p = "\u2460\u002e\u6309\u5347\u5e8f\u6392\u5217\u5c31\u7eea\u65f6\u95f4\u0020\u2461\u002e\u540e\u6765\u7684\u6309\u5230\u8fbe\u65f6\u95f4\u7684\u5148\u540e\u653e\u5165\u5728\u5c31\u7eea\u961f\u5217\u4e0a\uff0c\u518d\u5728\u73b0\u5728\u6309\u5230\u8fbe\u65f6\u95f4\u987a\u5e8f\u7684\u57fa\u7840\u4e0a\u518d\u6309\u8fd0\u884c\u65f6\u95f4\u7531\u77ed\u5230\u957f\u8fdb\u884c\u6392\u5e8f\u0020\u2462\u002e\u6bcf\u6b21\u53d6\u961f\u9996\u5143\u7d20\u8fd0\u884c\u3002";
    p = reconvert(p);
    addLabelToAlgorithmBar(sjfdescription);
    addLabelToAlgorithmBar(p);
}
ProcessScheduling.prototype.sjfStarttButtonCallback = function (option) {
    this.implementAction(this.sjf.bind(this), 0);
}
ProcessScheduling.prototype.sjf = function(value) {
    //this.point=value;    //后移的指针
    this.animationManager.clearHistory();
    this.commands = new Array();
    var tmpProcess;

    //先排序
    //
    Process.sort(by('readyTime',by('ServerTime')));
    var FinishTime = 0;
    this.recordProcess = new Array();
    this.recordProcess = Process.slice(0, Process.length);
    for (var i = 0; i < this.recordProcess.length; ++i)
    {
        var newArray = [];
        if(this.recordProcess[i].readyTime > FinishTime) //没有作业正在运行，取队首作业运行
            this.recordProcess[i].FinishTime = this.recordProcess[i].readyTime + this.recordProcess[i].ServerTime;
        else                                  //有作业正在运行，等待作业完毕，此作业再运行
            this.recordProcess[i].FinishTime = FinishTime + this.recordProcess[i].ServerTime;

        this.recordProcess[i].TurnoverTime = this.recordProcess[i].FinishTime - this.recordProcess[i].readyTime;
        this.recordProcess[i].WeightedTurnoverTime = (this.recordProcess[i].TurnoverTime / this.recordProcess[i].ServerTime).toFixed(2);
        FinishTime = this.recordProcess[i].FinishTime;

        //在一个作业运行期间，如果有其他作业到达，将他们按照服务时间升序排列
        var j = 1;
        while ((j + i) < this.recordProcess.length && this.recordProcess[i + j].readyTime <= FinishTime)
        ++j;

        newArray = this.recordProcess.slice(i + 1, i + j);
        newArray.sort(CmpByServerTime("ServerTime"));

        var Count = 0;
        for(var l = i + 1; l <= (i + j - 1); ++l){
            this.recordProcess[l] = newArray[Count++];
        }

    }
    tmpProcess = [0,1,2,3,4,5,6,7,8,9,10,11];
    for(var i = 0; i < this.recordProcess.length; ++i)
    {
        var p = "\u4ece\u5230\u8fbe\u7684\u8fdb\u7a0b\u627e\u5230\u8fd0\u884c\u65f6\u95f4\u6700\u77ed\u7684\u4e00\u4e2a\uff0c\u4e0a\u4e00\u4e2a\u8fdb\u7a0b\u7ed3\u675f\u65f6\u523b\u4e3a";
        p = reconvert(p);
        var p2 = "\uff0c\u672c\u6b21\u6700\u5148\u5230\u8fbe\u7684\u4e14\u6700\u77ed\u8fd0\u884c\u65f6\u95f4\u7684\u4e3a";
        p2 = reconvert(p2);
        var tmpFinishTime;
        if(i == 0)
            tmpFinishTime = 0;
        else
            tmpFinishTime = this.recordProcess[i - 1].FinishTime
        this.cmd("SetText", this.theStaus, p + tmpFinishTime + p2 + this.recordProcess[i].ServerTime);

        this.cmd("Step");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 2, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");

        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 2, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 4, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");

        //result flag
        var cResult = "\u8ba1\u7b97\u5f53\u524d\u8fdb\u7a0b\u7684\u5f00\u59cb\u65f6\u523b\u3001\u7ed3\u675f\u65f6\u523b\u548c\u5468\u8f6c\u65f6\u95f4\u7b49";
        cResult = reconvert(cResult);
        this.cmd("SetText", this.theStaus, cResult);
        //开始时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 4, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 8, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 9, this.recordProcess[i].FinishTime - this.recordProcess[i].ServerTime);
        this.cmd("Step");
        //结束时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 8, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 10, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 11, this.recordProcess[i].FinishTime);
        this.cmd("Step");
        //周转时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 10, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 13, this.recordProcess[i].TurnoverTime);
        this.cmd("Step");
        //带权周转时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 12, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 14, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 15, this.recordProcess[i].WeightedTurnoverTime);
        this.cmd("Step");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 14, "#fff");

        this.cmd("Step");
        var tmpFinishStaus = "\u5b8c\u6210\u3002";
        tmpFinishStaus = reconvert(tmpFinishStaus);
        this.cmd("SetText", this.theStaus, tmpFinishStaus);
        this.cmd("Step");
        var tmpExchange = "\u5c06\u5b8c\u6210\u540e\u7684\u8fdb\u7a0b\u4ea4\u6362\u5230\u524d\u9762\uff0c\u7136\u540e\u8fdb\u884c\u4e0b\u4e00\u4e2a\u3002";
        tmpExchange = reconvert(tmpExchange);
        this.cmd("SetText", this.theStaus, tmpExchange);
        this.cmd("Step");

        /*---依次移动到顶端----*/
        for(var j = 0; j <= 14; j += 2){
            this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + j, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        }

        for(var j = 0; j <= 14; j += 2) {
            this.cmd("Move", this.recordProcess[i].pid * 16 + j, this.array_width * (j / 2 + 1), this.barPositionsY[i]);
            this.cmd("Move", this.recordProcess[i].pid * 16 + 1 + j, this.array_width * (j / 2 + 1), this.barPositionsY[i] - 25);
        }

        var tmpIndex, tmp;
        for(var j = 1; j < 11; ++j){
            if(tmpProcess[j] == this.recordProcess[i].pid){
                tmpIndex = j;
                break;
            }
        }

        for(var j = 0; j <= 14; j += 2) {
            this.cmd("Move", (tmpProcess[i + 1]) * 16 + j, this.array_width * (j / 2 + 1), this.barPositionsY[tmpIndex - 1]);
            this.cmd("Move", (tmpProcess[i + 1]) * 16 + 1 + j, this.array_width *(j / 2 + 1), this.barPositionsY[tmpIndex - 1] - 25);
        }
        this.cmd("Step");

        tmp = tmpProcess[i + 1];
        tmpProcess[i + 1] = tmpProcess[tmpIndex];
        tmpProcess[tmpIndex] = tmp;
    }
    var tmpFinishStaus = "\u6240\u6709\u8fdb\u7a0b\u5747\u5df2\u5b8c\u6210\u3002";
    tmpFinishStaus = reconvert(tmpFinishStaus);
    this.cmd("SetText", this.theStaus, tmpFinishStaus);
    console.log(tmpProcess);
    console.log(this.recordProcess);
    this.cmd("Step");
    for(var i = 0; i < this.recordProcess.length; ++i)
    {
        for(var j = 0; j <= 14; j += 2)
        {
            this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + j, "#fff");
        }
    }

    return this.commands ;
}
//////////////////////////////////////////////////////////////////////SJF-end//////////////////////////////////////////////////////////////////////
//***

//***
//////////////////////////////////////////////////////////////////////PSA-start//////////////////////////////////////////////////////////////////////
ProcessScheduling.prototype.psaCallback = function (option) {
    Process = [];
    this.animationManager.clearHistory();
    this.randomizeArray(3);

    var task3 = "\u4f18\u5148\u7ea7\u8c03\u5ea6\u7b97\u6cd5\u5f00\u59cb";
    task3 = reconvert(task3);
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 9) {
        this.psaStartButton = addControlToAnimationBar("Button", task3);
        this.psaStartButton.onclick = this.psaStarttButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.psaStartButton = addControlToAnimationBar("Button", task3);
        this.psaStartButton.onclick = this.psaStarttButtonCallback.bind(this);
    }
    var psadescription = "\u4f18\u5148\u7ea7\u8c03\u5ea6\u6cd5\uff08\u0050\u0072\u0069\u006f\u0072\u0069\u0074\u0079\u0020\u0053\u0063\u0068\u0065\u0064\u0075\u006c\u0069\u006e\u0067\u0020\u0041\u006c\u0067\u006f\u0072\u0069\u0074\u0068\u006d\uff09\u5728\u8fdb\u7a0b\u8c03\u5ea6\u4e2d\u6bcf\u6b21\u8c03\u5ea6\u65f6\uff0c\u7cfb\u7edf\u628a\u5904\u7406\u673a\u5206\u914d\u7ed9\u5c31\u7eea\u961f\u5217\u4e2d\u4f18\u5148\u6570\u6700\u9ad8\u7684\u8fdb\u7a0b\u3002";
    psadescription = reconvert(psadescription);
    var p = "\u2460\u002e\u6309\u5347\u5e8f\u6392\u5217\u5c31\u7eea\u65f6\u95f4\u0020\u2461\u002e\u540e\u6765\u7684\u6309\u5230\u8fbe\u65f6\u95f4\u7684\u5148\u540e\u653e\u5165\u5728\u5c31\u7eea\u961f\u5217\u4e0a\uff0c\u518d\u5728\u73b0\u5728\u6309\u5230\u8fbe\u65f6\u95f4\u987a\u5e8f\u7684\u57fa\u7840\u4e0a\u518d\u6309\u4f18\u5148\u7ea7\u7531\u5927\u5230\u5c0f\u8fdb\u884c\u6392\u5e8f\u0020\u2462\u002e\u6bcf\u6b21\u53d6\u961f\u9996\u5143\u7d20\u8fd0\u884c\u3002";
    p = reconvert(p);
    addLabelToAlgorithmBar(psadescription);
    addLabelToAlgorithmBar(p);
}
ProcessScheduling.prototype.psaStarttButtonCallback = function (option) {
    this.implementAction(this.psa.bind(this), 0);
}
ProcessScheduling.prototype.psa = function (value) {
    this.animationManager.clearHistory();
    this.commands = new Array();
    var tmpProcess;

    Process.sort(by('readyTime',des('priority')));

    var FinishTime = -1;
    this.recordProcess = new Array();
    this.recordProcess = Process.slice(0, Process.length);
    for (var i = 0; i < this.recordProcess.length; ++i)
    {

        var newArray = [];
        if(this.recordProcess[i].readyTime > FinishTime) //没有作业正在运行，取队首作业运行
            this.recordProcess[i].FinishTime = this.recordProcess[i].readyTime + this.recordProcess[i].ServerTime;
        else                                  //有作业正在运行，等待作业完毕，此作业再运行
            this.recordProcess[i].FinishTime = FinishTime + this.recordProcess[i].ServerTime;

        this.recordProcess[i].TurnoverTime = this.recordProcess[i].FinishTime - this.recordProcess[i].readyTime;
        this.recordProcess[i].WeightedTurnoverTime = (this.recordProcess[i].TurnoverTime / this.recordProcess[i].ServerTime).toFixed(2);
        FinishTime = this.recordProcess[i].FinishTime;

        //在一个作业运行期间，如果有其他作业到达，将他们按照优先级降序排列
        var j = 1;
        while ((j + i) < this.recordProcess.length && this.recordProcess[i + j].readyTime <= FinishTime)
            ++j;

        newArray = this.recordProcess.slice(i + 1, i + j);
        CmpByLevel(newArray, 'priority');

        var Count = 0;
        for(var l = i + 1; l <= (i + j - 1); ++l){
            this.recordProcess[l] = newArray[Count++];
        }
    }
    console.log(this.recordProcess);

    tmpProcess = [0,1,2,3,4,5,6,7,8,9,10,11];
    console.log(tmpProcess);
    for(var i = 0; i < this.recordProcess.length; ++i)
    {
        var p = "\u4ece\u5230\u8fbe\u7684\u8fdb\u7a0b\u627e\u5230\u4f18\u5148\u7ea7\u6700\u5927\u7684\u4e00\u4e2a\uff0c\u4e0a\u4e00\u4e2a\u8fdb\u7a0b\u7ed3\u675f\u65f6\u523b\u4e3a";
        p = reconvert(p);
        var p2 = "\uff0c\u672c\u6b21\u6700\u5148\u5230\u8fbe\u7684\u4e14\u4f18\u5148\u7ea7\u6700\u5927\u7684\u4e3a";
        p2 = reconvert(p2);
        var tmpFinishTime;
        if(i == 0)
            tmpFinishTime = 0;
        else
            tmpFinishTime = this.recordProcess[i - 1].FinishTime
        this.cmd("SetText", this.theStaus, p + tmpFinishTime + p2 + this.recordProcess[i].priority);

        this.cmd("Step");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 2, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 2, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 6, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");

        //result flag
        var cResult = "\u8ba1\u7b97\u5f53\u524d\u8fdb\u7a0b\u7684\u5f00\u59cb\u65f6\u523b\u3001\u7ed3\u675f\u65f6\u523b\u548c\u5468\u8f6c\u65f6\u95f4\u7b49";
        cResult = reconvert(cResult);
        this.cmd("SetText", this.theStaus, cResult);

        //开始时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 6, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 8, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 9, this.recordProcess[i].FinishTime - this.recordProcess[i].ServerTime);
        this.cmd("Step");
        //结束时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 8, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 10, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 11, this.recordProcess[i].FinishTime);
        this.cmd("Step");
        //周转时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 10, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 13, this.recordProcess[i].TurnoverTime);
        this.cmd("Step");
        //带权周转时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 12, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 14, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 15, this.recordProcess[i].WeightedTurnoverTime);
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 14, "#fff");
        this.cmd("Step");

        this.cmd("Step");
        var tmpFinishStaus = "\u5b8c\u6210\u3002";
        tmpFinishStaus = reconvert(tmpFinishStaus);
        this.cmd("SetText", this.theStaus, tmpFinishStaus);
        this.cmd("Step");
        var tmpExchange = "\u5c06\u5b8c\u6210\u540e\u7684\u8fdb\u7a0b\u4ea4\u6362\u5230\u524d\u9762\uff0c\u7136\u540e\u8fdb\u884c\u4e0b\u4e00\u4e2a\u3002";
        tmpExchange = reconvert(tmpExchange);
        this.cmd("SetText", this.theStaus, tmpExchange);
        this.cmd("Step");

        /*---依次移动到顶端----*/
        for(var j = 0; j <= 14; j += 2){
            this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + j, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        }

        for(var j = 0; j <= 14; j += 2) {
            this.cmd("Move", this.recordProcess[i].pid * 16 + j, this.array_width * (j / 2 + 1), this.barPositionsY[i]);
            this.cmd("Move", this.recordProcess[i].pid * 16 + 1 + j, this.array_width * (j / 2 + 1), this.barPositionsY[i] - 25);
        }

        var tmpIndex, tmp;
        for(var j = 1; j < 11; ++j){
            if(tmpProcess[j] == this.recordProcess[i].pid){
                tmpIndex = j;
                break;
            }
        }

        for(var j = 0; j <= 14; j += 2) {
            this.cmd("Move", (tmpProcess[i + 1]) * 16 + j, this.array_width * (j / 2 + 1), this.barPositionsY[tmpIndex - 1]);
            this.cmd("Move", (tmpProcess[i + 1]) * 16 + 1 + j, this.array_width *(j / 2 + 1), this.barPositionsY[tmpIndex - 1] - 25);
        }
        this.cmd("Step");

        tmp = tmpProcess[i + 1];
        tmpProcess[i + 1] = tmpProcess[tmpIndex];
        tmpProcess[tmpIndex] = tmp;
    }
    var tmpFinishStaus = "\u6240\u6709\u8fdb\u7a0b\u5747\u5df2\u5b8c\u6210\u3002";
    tmpFinishStaus = reconvert(tmpFinishStaus);
    this.cmd("SetText", this.theStaus, tmpFinishStaus);
    this.cmd("Step");
    for(var i = 0; i < this.recordProcess.length; ++i)
    {
        for(var j = 0; j <= 14; j += 2)
        {
            this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + j, "#fff");
        }
    }

    return this.commands ;
}
//////////////////////////////////////////////////////////////////////PSA-end//////////////////////////////////////////////////////////////////////
//***

//***
//////////////////////////////////////////////////////////////////////HRRN-start//////////////////////////////////////////////////////////////////////
ProcessScheduling.prototype.hrrnCallback = function (option) {
    Process = [];
    this.animationManager.clearHistory();
    this.randomizeArray(4);

    var task4 = "\u9ad8\u54cd\u5e94\u6bd4\u4f18\u5148\u8c03\u5ea6\u7b97\u6cd5\u5f00\u59cb";
    task4 = reconvert(task4);
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 9) {
        this.hrrnStartButton = addControlToAnimationBar("Button", task4);
        this.hrrnStartButton.onclick = this.hrrnStarttButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.hrrnStartButton = addControlToAnimationBar("Button", task4);
        this.hrrnStartButton.onclick = this.hrrnStarttButtonCallback.bind(this);
    }
    var hrrndescription = "\u9ad8\u54cd\u5e94\u6bd4\u4f18\u5148\u8c03\u5ea6\u7b97\u6cd5\uff08\u0048\u0069\u0067\u0068\u0065\u0073\u0074\u0020\u0052\u0065\u0073\u0070\u006f\u006e\u0073\u0065\u0020\u0052\u0061\u0074\u0069\u006f\u0020\u004e\u0065\u0078\u0074\uff09\u662f\u4e00\u79cd\u5bf9\u0043\u0050\u0055\u4e2d\u592e\u63a7\u5236\u5668\u54cd\u5e94\u6bd4\u7684\u5206\u914d\u7684\u4e00\u79cd\u7b97\u6cd5\u3002\u0048\u0052\u0052\u004e\u662f\u4ecb\u4e8e\u0046\u0043\u0046\u0053\uff08\u5148\u6765\u5148\u670d\u52a1\u7b97\u6cd5\uff09\u4e0e\u0053\u004a\u0046\uff08\u77ed\u4f5c\u4e1a\u4f18\u5148\u7b97\u6cd5\uff09\u4e4b\u95f4\u7684\u6298\u4e2d\u7b97\u6cd5\uff0c\u65e2\u8003\u8651\u4f5c\u4e1a\u7b49\u5f85\u65f6\u95f4\u53c8\u8003\u8651\u4f5c\u4e1a\u8fd0\u884c\u65f6\u95f4\uff0c\u65e2\u7167\u987e\u77ed\u4f5c\u4e1a\u53c8\u4e0d\u4f7f\u957f\u4f5c\u4e1a\u7b49\u5f85\u65f6\u95f4\u8fc7\u957f\uff0c\u6539\u8fdb\u4e86\u8c03\u5ea6\u6027\u80fd\u3002";
    hrrndescription = reconvert(hrrndescription);
    var p = "\u2460\u002e\u6309\u5347\u5e8f\u6392\u5217\u5c31\u7eea\u65f6\u95f4\u0020\u2461\u002e\u8ba1\u7b97\u5f53\u524d\u5230\u8fbe\u4e86\u7684\u8fdb\u7a0b\u7684\u54cd\u5e94\u6bd4\u0020\u2462\u002e\u53d6\u54cd\u5e94\u6bd4\u6700\u9ad8\u7684\u8fdb\u7a0b\u8fd0\u884c\u0020";
    p = reconvert(p);
    addLabelToAlgorithmBar(hrrndescription);
    addLabelToAlgorithmBar(p);
}
ProcessScheduling.prototype.hrrnStarttButtonCallback = function (option) {
    this.implementAction(this.hrrn.bind(this), 0);
}
ProcessScheduling.prototype.hrrn = function (value) {
    this.animationManager.clearHistory();
    this.commands = new Array();
    var tmpProcess;

    //Process.sort(by('readyTime'));
    //计算响应比优先级
    for(var i = 0; i < Process.length; ++i) {
        Process[i].level = parseFloat(((Process[i].ServerTime + Process[i].readyTime) / Process[i].ServerTime).toFixed(2));
    }
    Process.sort(by('readyTime',des('level')));

    console.log(Process);

    var FinishTime = -1;
    var saveTheLevelStaus = new Array();
    var saveTheIdStaus = new Array();
    var saveTheServerStaus = new Array();
    var saveTheReadyStaus = new Array();
    var stausCount = 0;
    this.recordProcess = new Array();
    this.recordProcess = Process.slice(0, Process.length);
    for (var i = 0; i < this.recordProcess.length; ++i)
    {

        if(this.recordProcess[i].readyTime > FinishTime) //没有作业正在运行，取队首作业运行
            this.recordProcess[i].FinishTime = this.recordProcess[i].readyTime + this.recordProcess[i].ServerTime;
        else                                  //有作业正在运行，等待作业完毕，此作业再运行
            this.recordProcess[i].FinishTime = FinishTime + this.recordProcess[i].ServerTime;

        this.recordProcess[i].TurnoverTime = this.recordProcess[i].FinishTime - this.recordProcess[i].readyTime;
        this.recordProcess[i].WeightedTurnoverTime = (this.recordProcess[i].TurnoverTime / this.recordProcess[i].ServerTime).toFixed(2);
        FinishTime = this.recordProcess[i].FinishTime;

        //在一个作业运行期间，如果有其他作业到达，将他们按照优先级降序排列
        var j = 1;
        while ((j + i) < this.recordProcess.length && this.recordProcess[i + j].readyTime <= FinishTime)
            ++j;

        var b = i + 1, e = i + j;
        while(b < e){
            this.recordProcess[b].level = parseFloat(((this.recordProcess[b].ServerTime + (FinishTime - this.recordProcess[b].readyTime)) / this.recordProcess[b].ServerTime).toFixed(2));
            ++b;
        }
        // TODO: 浮点数的比较
        var hrrnArray = [];
        hrrnArray = this.recordProcess.slice(i + 1, i + j);
        hrrnArray.sort(function(a, b) { return b.level - a.level; });

        if(hrrnArray.length > 0) {
            saveTheLevelStaus[stausCount] = new Array();
            saveTheIdStaus[stausCount] = new Array();
            saveTheReadyStaus[stausCount] = new Array();
            saveTheServerStaus[stausCount] = new Array();
        }

        var Count = 0;
        for(var l = i + 1; l <= (i + j - 1); ++l){
            console.log(hrrnArray[Count].level);
            var tmpStausLevel;
            tmpStausLevel = hrrnArray[Count];
            saveTheLevelStaus[stausCount][l] = tmpStausLevel.level;
            saveTheIdStaus[stausCount][l] = tmpStausLevel.pid;
            saveTheReadyStaus[stausCount][l] = tmpStausLevel.readyTime;
            saveTheServerStaus[stausCount][l] = tmpStausLevel.ServerTime;
            this.recordProcess[l] = hrrnArray[Count++];
        }
        stausCount++;
        console.log("fuck");
    }
    console.log(saveTheLevelStaus);
    tmpProcess = [0,1,2,3,4,5,6,7,8,9,10,11];
    var findTheStaus = 0;
    for(var i = 0; i < this.recordProcess.length; ++i)
    {

        var p = "\u5bf9\u5230\u8fbe\u540e\u7684\u8fdb\u7a0b\u8fdb\u884c\u54cd\u5e94\u6bd4\u7684\u8ba1\u7b97\uff0c\u4e0a\u4e00\u4e2a\u8fdb\u7a0b\u7ed3\u675f\u65f6\u523b\u4e3a";
        p = reconvert(p);
        var p2 = "\uff0c\u672c\u6b21\u7684\u54cd\u5e94\u6bd4\u4e3a";
        p2 = reconvert(p2);
        var tmpFinishTime;
        if(i == 0)
            tmpFinishTime = 0;
        else
            tmpFinishTime = this.recordProcess[i - 1].FinishTime

        this.cmd("SetText", this.theStaus, p + tmpFinishTime + p2 + this.recordProcess[i].level);

        this.cmd("Step");

        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 6, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 6, "#fff");
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 7, this.recordProcess[i].level);
        this.cmd("Step");
        //result flag
        var cResult = "\u8ba1\u7b97\u5f53\u524d\u8fdb\u7a0b\u7684\u5f00\u59cb\u65f6\u523b\u3001\u7ed3\u675f\u65f6\u523b\u548c\u5468\u8f6c\u65f6\u95f4\u7b49";
        cResult = reconvert(cResult);
        this.cmd("SetText", this.theStaus, cResult);
        //开始时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 6, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 8, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 9, this.recordProcess[i].FinishTime - this.recordProcess[i].ServerTime);
        this.cmd("Step");
        //结束时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 8, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 10, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 11, this.recordProcess[i].FinishTime);
        this.cmd("Step");
        //周转时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 10, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 13, this.recordProcess[i].TurnoverTime);
        this.cmd("Step");
        //带权周转时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 12, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 14, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 15, this.recordProcess[i].WeightedTurnoverTime);
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 14, "#fff");
        this.cmd("Step");
        /*---依次移动到顶端----*/

        if(saveTheLevelStaus[findTheStaus] != null || saveTheLevelStaus[findTheStaus] != undefined){
            for(var m = 0; m < saveTheLevelStaus[findTheStaus].length; ++m) {
                if(saveTheLevelStaus[findTheStaus][m] != null || saveTheLevelStaus[findTheStaus][m] != undefined) {
                    console.log(saveTheLevelStaus[findTheStaus][m].level);
                    var tmpLevelStaus = saveTheLevelStaus[findTheStaus][m], tmpIdStaus = saveTheIdStaus[findTheStaus][m];
                    var tmpServerStaus = saveTheServerStaus[findTheStaus][m], tmpReadyStaus = saveTheReadyStaus[findTheStaus][m];
                    var ctcp = "\u8ba1\u7b97\u5728\u8fd9\u6b21\u8fdb\u7a0b\u8fd0\u884c\u65f6\u95f4\u5185\u5230\u8fbe\u7684\u8fdb\u7a0b\u7684\u54cd\u5e94\u6bd4\uff0c\u672c\u6b21\u8fdb\u7a0b\u7ed3\u675f\u65f6\u523b\u4e3a";
                    ctcp = reconvert(ctcp);
                    var ctcp2 = "\uff0c\u4e0b\u6b21\u5230\u8fbe\u7684\u8fdb\u7a0b\u0049\u0044\u4e3a";
                    ctcp2 = reconvert(ctcp2);
                    var ctcp3 = "\uff0c\u8ba1\u7b97\u5176\u54cd\u5e94\u6bd4";
                    ctcp3 = reconvert(ctcp3);
                    var tmpWaitStaus = this.recordProcess[i].FinishTime - tmpReadyStaus;
                    this.cmd("SetBackgroundColor", tmpIdStaus * 16 + 6, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("SetText", this.theStaus, ctcp + this.recordProcess[i].FinishTime + ctcp2 + tmpIdStaus + ctcp3 + "(" + tmpWaitStaus + "+" + tmpServerStaus + ")" + "/" + tmpServerStaus + "=" + tmpLevelStaus);
                    this.cmd("Step");
                    this.cmd("SetText", tmpIdStaus * 16 + 7, tmpLevelStaus);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", tmpIdStaus * 16 + 6, "#fff");
                }
            }
        }
        findTheStaus++;


        this.cmd("Step");
        var tmpFinishStaus = "\u5b8c\u6210\u3002";
        tmpFinishStaus = reconvert(tmpFinishStaus);
        this.cmd("SetText", this.theStaus, tmpFinishStaus);
        this.cmd("Step");
        var tmpExchange = "\u5c06\u5b8c\u6210\u540e\u7684\u8fdb\u7a0b\u4ea4\u6362\u5230\u524d\u9762\uff0c\u7136\u540e\u8fdb\u884c\u4e0b\u4e00\u4e2a\u3002";
        tmpExchange = reconvert(tmpExchange);
        this.cmd("SetText", this.theStaus, tmpExchange);
        this.cmd("Step");

        for(var j = 0; j <= 14; j += 2){
            this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + j, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        }

        for(var j = 0; j <= 14; j += 2) {
            this.cmd("Move", this.recordProcess[i].pid * 16 + j, this.array_width * (j / 2 + 1), this.barPositionsY[i]);
            this.cmd("Move", this.recordProcess[i].pid * 16 + 1 + j, this.array_width * (j / 2 + 1), this.barPositionsY[i] - 25);
        }

        var tmpIndex, tmp;
        for(var j = 1; j < 11; ++j){
            if(tmpProcess[j] == this.recordProcess[i].pid){
                tmpIndex = j;
                break;
            }
        }

        for(var j = 0; j <= 14; j += 2) {
            this.cmd("Move", (tmpProcess[i + 1]) * 16 + j, this.array_width * (j / 2 + 1), this.barPositionsY[tmpIndex - 1]);
            this.cmd("Move", (tmpProcess[i + 1]) * 16 + 1 + j, this.array_width *(j / 2 + 1), this.barPositionsY[tmpIndex - 1] - 25);
        }
        this.cmd("Step");

        tmp = tmpProcess[i + 1];
        tmpProcess[i + 1] = tmpProcess[tmpIndex];
        tmpProcess[tmpIndex] = tmp;
    }
    var tmpFinishStaus = "\u6240\u6709\u8fdb\u7a0b\u5747\u5df2\u5b8c\u6210\u3002";
    tmpFinishStaus = reconvert(tmpFinishStaus);
    this.cmd("SetText", this.theStaus, tmpFinishStaus);
    this.cmd("Step");
    for(var i = 0; i < this.recordProcess.length; ++i)
    {
        for(var j = 0; j <= 14; j += 2)
        {
            this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + j, "#fff");
        }
    }

    return this.commands ;
}
//////////////////////////////////////////////////////////////////////HRRN-end//////////////////////////////////////////////////////////////////////
//***

//***
//////////////////////////////////////////////////////////////////////RR-start//////////////////////////////////////////////////////////////////////
ProcessScheduling.prototype.rrCallback = function (option) {
    Process = [];
    this.animationManager.clearHistory();
    this.randomizeArray(5);

    var task5 = "\u65f6\u95f4\u7247\u8f6e\u8f6c\u8c03\u5ea6\u7b97\u6cd5\u5f00\u59cb";
    task5 = reconvert(task5);
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 9) {
        this.rrStartButton = addControlToAnimationBar("Button", task5);
        this.rrStartButton.onclick = this.rrStarttButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.rrStartButton = addControlToAnimationBar("Button", task5);
        this.rrStartButton.onclick = this.rrStarttButtonCallback.bind(this);
    }
    var rrdescription = "\u65f6\u95f4\u7247\u8f6e\u8f6c\u6cd5\uff08\u0052\u006f\u0075\u006e\u0064\u002d\u0052\u006f\u0062\u0069\u006e\uff09\u7cfb\u7edf\u5148\u628a\u6240\u6709\u5c31\u7eea\u8fdb\u7a0b\u6309\u5148\u5165\u5148\u51fa\u7684\u539f\u5219\u6392\u6210\u4e00\u4e2a\u961f\u5217\uff0c\u65b0\u6765\u7684\u8fdb\u7a0b\u52a0\u5230\u5c31\u7eea\u961f\u5217\u672b\u5c3e\uff0c\u6bcf\u5f53\u6267\u884c\u8fdb\u7a0b\u8c03\u5ea6\u65f6\uff0c\u8fdb\u7a0b\u8c03\u5ea6\u7a0b\u5e8f\u603b\u662f\u9009\u51fa\u5c31\u7eea\u961f\u5217\u7684\u961f\u9996\u8fdb\u7a0b\uff0c\u8ba9\u5b83\u5728\u0043\u0050\u0055\u4e0a\u8fd0\u884c\u4e00\u4e2a\u65f6\u95f4\u7247\u7684\u65f6\u95f4\u3002\u5f53\u8fdb\u7a0b\u7528\u5b8c\u5206\u7ed9\u5b83\u7684\u65f6\u95f4\u7247\u540e\uff0c\u7cfb\u7edf\u7684\u8ba1\u65f6\u5668\u53d1\u51fa\u65f6\u949f\u4e2d\u65ad\uff0c\u8c03\u5ea6\u7a0b\u5e8f\u4fbf\u505c\u6b62\u8be5\u8fdb\u7a0b\u7684\u8fd0\u884c\uff0c\u628a\u5b83\u653e\u5165\u5c31\u7eea\u961f\u5217\u7684\u672b\u5c3e\uff1b\u7136\u540e\uff0c\u628a\u0043\u0050\u0055\u5206\u7ed9\u5c31\u7eea\u961f\u5217\u7684\u961f\u9996\u8fdb\u7a0b\uff0c\u540c\u6837\u4e5f\u8ba9\u5b83\u8fd0\u884c\u4e00\u4e2a\u65f6\u95f4\u7247\uff0c\u5982\u6b64\u5f80\u590d\u3002";
    rrdescription = reconvert(rrdescription);
    var p = "\u9ed8\u8ba4\u65f6\u95f4\u7247\u4e3a\u0035\u0020\u2460\u002e\u53d6\u4f4d\u4e8e\u5c31\u7eea\u961f\u5217\u961f\u9996\u7684\u8fdb\u7a0b\u5728\u65f6\u95f4\u7247\u5927\u5c0f\u7684\u65f6\u95f4\u5185\u5185\u8fd0\u884c\u0020\u2461\u002e\u8fdb\u7a0b\u8fd0\u884c\u5b8c\u6bd5\uff0c\u8ba1\u7b97\u76f8\u5173\u7ed3\u679c\u0020\u2462\u002e\u82e5\u679c\u6ca1\u6709\u8fd0\u884c\u5b8c\u6bd5\uff0c\u5c06\u8fdb\u7a0b\u585e\u81f3\u5c31\u7eea\u961f\u5217\u961f\u5c3e\uff0c\u518d\u4ece\u5c31\u7eea\u961f\u5217\u961f\u9996\u53d6\u51fa\u4e00\u4e2a\u8fdb\u7a0b\u8fd0\u884c\uff0c\u76f4\u5230\u5c31\u7eea\u961f\u5217\u4e3a\u7a7a";
    p = reconvert(p);
    addLabelToAlgorithmBar(rrdescription);
    addLabelToAlgorithmBar(p);
}
ProcessScheduling.prototype.rrStarttButtonCallback = function (option) {
    this.implementAction(this.rr.bind(this), 0);
}
ProcessScheduling.prototype.rr = function (value) {
    this.animationManager.clearHistory();
    this.commands = new Array();

    var tmpProcess = new Array();
    var timeslice = 5;//时间片
    Process.sort(by('readyTime'));
    for(var i = 0; i < Process.length; ++i){
        tmpProcess.unshift(Process[i]);
    }

    var result = new Array(), Ready = new Array();
    var BeginTime = tmpProcess[tmpProcess.length - 1].readyTime;
    Ready.unshift(tmpProcess[tmpProcess.length - 1]);
    tmpProcess.pop();
    console.log(Process);

    var tmpFirstProcessID = Ready[Ready.length - 1].pid;
    var tmpFirstProcessStaus = "\u9996\u5148\u5c06\u7b2c\u4e00\u4e2a\u5230\u8fbe\u7684\u8fdb\u7a0b\u5904\u4e8e\u65f6\u95f4\u7247\u5185\u8fd0\u884c\uff0c\u5f53\u524d\u8fdb\u7a0b\u0049\u0044\u4e3a";
    tmpFirstProcessStaus = reconvert(tmpFirstProcessStaus);
    this.cmd("SetText", this.theStaus, tmpFirstProcessStaus + tmpFirstProcessID);
    this.cmd("Step");

    var tmpNextProcessId = null;

    var CountTheProcess = new Array();
    for(var i = 0; i <= 10; ++i){
        CountTheProcess[i] = 0;
    }
    this.cmd("SetBackgroundColor", tmpFirstProcessID * 16, HIGHLIGHT_BAR_BACKGROUND_COLOR);
    while (tmpProcess.length != 0 || Ready.length != 0)
    {
        if (tmpProcess.length != 0 && BeginTime >= tmpProcess[tmpProcess.length - 1].readyTime)    //有新作业到达，加入就绪队列
        {
            Ready.push(tmpProcess[tmpProcess.length - 1]);
            //既然来到这里，当然是有一个新的开始啦
            var signId = Ready[Ready.length - 1].pid;
            var NextProcessText = "\u4e0b\u4e00\u4e2a\u8fdb\u884c\u65f6\u95f4\u7247\u5185\u8fd0\u884c\u7684\u8fdb\u7a0b\u0049\u0044\u4e3a";
            NextProcessText = reconvert(NextProcessText);
            this.cmd("SetText", this.theStaus, NextProcessText + signId);
            this.cmd("Step");
            this.cmd("SetBackgroundColor", signId * 16, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("Step");

            tmpProcess.pop();
        }
        else if(Ready.length == 0 && tmpProcess.length != 0 && BeginTime < tmpProcess[tmpProcess.length - 1].readyTime){
            BeginTime = tmpProcess[tmpProcess.length - 1].readyTime;
            var FindTheFutureTime = "\u7531\u4e8e\u76ee\u524d\u5c31\u7eea\u961f\u5217\u5df2\u7ecf\u6ca1\u6709\u8fdb\u7a0b\uff0c\u56e0\u800c\u53d6\u672a\u6765\u7b2c\u4e00\u4e2a\u5230\u8fbe\u7684\u8fdb\u7a0b\u5c31\u7eea\u65f6\u95f4\u4e3a\u5f53\u524d\u65f6\u95f4\u3002";
            FindTheFutureTime = reconvert(FindTheFutureTime);
            this.cmd("SetText", this.theStaus, FindTheFutureTime);
            this.cmd("Step");
            var fuckThatShit = "\u65b0\u7684\u8fdb\u7a0b\u0049\u0044\u4e3a";
            fuckThatShit = reconvert(fuckThatShit);
            this.cmd("SetText", this.theStaus, fuckThatShit + tmpProcess[tmpProcess.length - 1].pid);
            this.cmd("Step");
            continue;
        }
        if (Ready[Ready.length - 1].FinishTime + timeslice < Ready[Ready.length - 1].ServerTime)     //时间片用完没运行完,加入队尾
        {
            CountTheProcess[Ready[Ready.length - 1].pid] ++;
            if(Ready[Ready.length - 1].pid == tmpNextProcessId && tmpNextProcessId != null){
                var tmpTheSameProcessText = "\u7531\u4e8e\u5728\u8fd0\u884c\u65f6\u5c31\u7eea\u961f\u5217\u5185\u6ca1\u6709\u65b0\u7684\u8fdb\u7a0b\u5165\u5185\uff0c\u6240\u4ee5\u7ee7\u7eed\u5728\u65f6\u95f4\u7247\u5185\u8fd0\u884c\u8fdb\u7a0b";
                tmpTheSameProcessText = reconvert(tmpTheSameProcessText);
                this.cmd("SetText", this.theStaus, tmpTheSameProcessText + tmpNextProcessId);
                this.cmd("Step");
            }

            //描述
            var signFinishTime = Ready[Ready.length - 1].FinishTime, signServerTime = Ready[Ready.length - 1].ServerTime;
            var tmpFinishOrNot = "\u7531\u4e8e\u5f53\u524d\u8fdb\u7a0b\u7684\u670d\u52a1\u65f6\u95f4\u5927\u4e8e\u65f6\u95f4\u7247\uff0c\u5373";
            tmpFinishOrNot = reconvert(tmpFinishOrNot);
            this.cmd("SetText", this.theStaus, tmpFinishOrNot + signServerTime + ">" + timeslice);
            this.cmd("Step");
            Ready[Ready.length - 1].FinishTime += (timeslice + BeginTime);

            //暂时的结束时刻更改
            var signTheFirstEndTime = "\u8bb0\u5f55\u7b2c\u4e00\u6b21\u5b8c\u7ed3\u7684\u65f6\u523b\u3002";
            signTheFirstEndTime = reconvert(signTheFirstEndTime);
            this.cmd("SetText", this.theStaus, signTheFirstEndTime);
            this.cmd("Step");
            this.cmd("SetBackgroundColor", Ready[Ready.length - 1].pid * 16 + 10, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("Step");
            this.cmd("SetText", Ready[Ready.length - 1].pid * 16 + 11, Ready[Ready.length - 1].FinishTime);
            this.cmd("Step");
            this.cmd("SetBackgroundColor", Ready[Ready.length - 1].pid * 16 + 10, "#fff");
            this.cmd("SetBackgroundColor", Ready[Ready.length - 1].pid * 16, "#fff");
            this.cmd("Step");

            Ready.unshift(Ready[Ready.length - 1]);
            Ready.pop();
            BeginTime += timeslice;
            //没有在时间片内完成的text
            var hasntFinishText = "\u8fdb\u7a0b\u672a\u5b8c\u6210\uff0c\u653e\u5165\u5c31\u7eea\u961f\u5217\u961f\u5c3e\u3002";
            hasntFinishText = reconvert(hasntFinishText);
            this.cmd("SetText", this.theStaus, hasntFinishText);
            this.cmd("Step");

            tmpNextProcessId = Ready[Ready.length - 1].pid;
        }
        else        //此作业运行完
        {
            if(CountTheProcess[Ready[Ready.length - 1].pid] != 1){
                var FinishResult = "\u7531\u4e8e\u5f53\u524d\u8fdb\u7a0b\u7684\u9700\u670d\u52a1\u65f6\u95f4\u5c0f\u4e8e\u4e00\u4e2a\u65f6\u95f4\u7247\uff0c\u5373";
                FinishResult = reconvert(FinishResult);
                var FinishResult2 = "\uff0c\u6b64\u8fdb\u7a0b\u80fd\u5728\u4e00\u4e2a\u65f6\u95f4\u7247\u5185\u5b8c\u6210\u3002";
                FinishResult2 = reconvert(FinishResult2);
                this.cmd("SetText", this.theStaus, FinishResult + Ready[Ready.length - 1].ServerTime + "<" + timeslice + FinishResult2);
                this.cmd("Step");
                BeginTime += Ready[Ready.length - 1].ServerTime;
            }
            else{
                var FinishResult = "\u5f53\u524d\u8fdb\u7a0b\u865a\u670d\u52a1\u65f6\u95f4\u4e3a";
                FinishResult = reconvert(FinishResult);
                var FinishResult2 = "\uff0c\u5728\u7ecf\u5386\u7b2c\u4e00\u4e2a\u65f6\u95f4\u7247\u540e\u7684\u5269\u4f59\u65f6\u95f4";
                FinishResult2 = reconvert(FinishResult2);
                var FinishResult3 = "\u8db3\u591f\u5b8c\u6210\u6b64\u8fdb\u7a0b\u3002";
                FinishResult3 = reconvert(FinishResult3);
                BeginTime += (Ready[Ready.length - 1].ServerTime - timeslice);
                var tmpCount = Ready[Ready.length - 1].ServerTime - timeslice;
                this.cmd("SetText", this.theStaus, FinishResult + Ready[Ready.length - 1].ServerTime + FinishResult2 + tmpCount + FinishResult3);
                this.cmd("Step");
            }
            var taskp1 = "\u8fdb\u7a0b";
            taskp1 = reconvert(taskp1);
            var taskp2 = "\u8fd0\u884c\u5b8c\u6210\uff0c\u5f00\u59cb\u7edf\u8ba1\u6b64\u8fdb\u7a0b\u7684\u5f00\u59cb\u65f6\u523b\u3001\u7ed3\u675f\u65f6\u523b\u3001\u5468\u8f6c\u65f6\u95f4\u7b49\u3002";
            taskp2 = reconvert(taskp2);
            this.cmd("SetText", this.theStaus, taskp1 + Ready[Ready.length - 1].pid + taskp2);
            this.cmd("Step");


            Ready[Ready.length - 1].FinishTime = BeginTime;
            Ready[Ready.length - 1].TurnoverTime = Ready[Ready.length - 1].FinishTime - Ready[Ready.length - 1].readyTime;
            Ready[Ready.length - 1].WeightedTurnoverTime = (parseFloat(Ready[Ready.length - 1].TurnoverTime) / parseFloat(Ready[Ready.length - 1].ServerTime)).toFixed(2);

            //结束时间
            this.cmd("SetBackgroundColor", Ready[Ready.length - 1].pid * 16 + 10, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText", Ready[Ready.length - 1].pid * 16 + 11, Ready[Ready.length - 1].FinishTime);
            this.cmd("Step");
            //周转时间
            this.cmd("SetBackgroundColor", Ready[Ready.length - 1].pid * 16 + 10, "#fff");
            this.cmd("SetBackgroundColor", Ready[Ready.length - 1].pid * 16 + 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText", Ready[Ready.length - 1].pid * 16 + 13, Ready[Ready.length - 1].TurnoverTime);
            this.cmd("Step");
            //带权周转时间
            this.cmd("SetBackgroundColor", Ready[Ready.length - 1].pid * 16 + 12, "#fff");
            this.cmd("SetBackgroundColor", Ready[Ready.length - 1].pid * 16 + 14, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText", Ready[Ready.length - 1].pid * 16 + 15, Ready[Ready.length - 1].WeightedTurnoverTime);
            this.cmd("SetBackgroundColor", Ready[Ready.length - 1].pid * 16 + 14, "#fff");
            this.cmd("Step");

            //完成的染上绿色标记
            for(var j = 0; j <= 14; j += 2){
                this.cmd("SetBackgroundColor", Ready[Ready.length - 1].pid * 16 + j, "#008B00");
            }

            //从就绪队列中移除作业
            result.push(Ready[Ready.length - 1]);
            Ready.pop();
        }
    }
    console.log(tmpProcess);
    console.log(result);
    var tmpFinishStaus = "\u6240\u6709\u8fdb\u7a0b\u5747\u5df2\u5b8c\u6210\u3002";
    tmpFinishStaus = reconvert(tmpFinishStaus);
    this.cmd("SetText", this.theStaus, tmpFinishStaus);
    this.cmd("Step");

    return this.commands ;
}
//////////////////////////////////////////////////////////////////////RR-end//////////////////////////////////////////////////////////////////////
//***


//Unicode转码
function reconvert(str){
    str = str.replace(/(\\u)(\w{1,4})/gi,function($0){
        return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g,"$2")),16)));
    });
    str = str.replace(/(&#x)(\w{1,4});/gi,function($0){
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g,"$2"),16));
    });
    str = str.replace(/(&#)(\d{1,6});/gi,function($0){
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g,"$2")));
    });
    return str;
}

//random array info
ProcessScheduling.prototype.randomizeArray = function (type) {
    this.commands = new Array();
    var bgt = "\u5f00\u59cb\u65f6\u523b";
    bgt = reconvert(bgt);
    var pid = "\u8fdb\u7a0b\u540d";
    pid = reconvert(pid);
    var rt = "\u5c31\u7eea\u65f6\u95f4";
    rt = reconvert(rt);
    var dt = "\u8fd0\u884c\u65f6\u95f4";
    dt = reconvert(dt);
    var pr = "\u4f18\u5148\u7ea7"
    pr = reconvert(pr);
    var et = "\u7ed3\u675f\u65f6\u523b";
    et = reconvert(et);
    var runningtime = "\u5468\u8f6c\u65f6\u95f4";
    runningtime = reconvert(runningtime);
    var rtv = "\u5e26\u6743\u5468\u8f6c\u65f6\u95f4";
    rtv = reconvert(rtv);
    var labelCount = 0;
    this.cmd("SetText",this.barLabels[labelCount++],pid);
    this.cmd("SetText",this.barLabels[labelCount++],rt);
    this.cmd("SetText",this.barLabels[labelCount++],dt);
    this.cmd("SetText",this.barLabels[labelCount++],pr);
    this.cmd("SetText",this.barLabels[labelCount++],bgt);
    this.cmd("SetText",this.barLabels[labelCount++],et);
    this.cmd("SetText",this.barLabels[labelCount++],runningtime);
    this.cmd("SetText",this.barLabels[labelCount++],rtv);

    if(type == 1) {
        this.readyTime = createRandomArr(10, 1, 30);
    }

    for(var i = 0; i < this.array_size; ++i){
        var item = {};

        if(type != 1)
            this.readyTime[i] = Math.floor(1 + Math.random() * 30);
        this.ServerTime[i] = Math.floor(1 + Math.random()*10);
        this.priority[i] = Math.floor(1 + Math.random()*5);
        item.pid = i + 1;
        item.readyTime = this.readyTime[i];
        item.ServerTime = this.ServerTime[i];
        item.priority = this.priority[i];
        item.FinishTime = 0;
        item.level = 0;
        Process.push(item);
        for(var j = 0; j < 8; ++j) {
            if(j == 0)
                this.cmd("SetText", this.barLabels[labelCount++], i + 1);
            else if(j == 1)
                this.cmd("SetText", this.barLabels[labelCount++], this.readyTime[i]);
            else if(j == 2)
                this.cmd("SetText", this.barLabels[labelCount++], this.ServerTime[i]);
            else if(j == 3)
                this.cmd("SetText", this.barLabels[labelCount++], this.priority[i]);
            else
                this.cmd("SetText", this.barLabels[labelCount++], 0);
        }
        //this.cmd("SetHeight", this.barObjects[i], this.arrayData[i] * SCALE_FACTOR);
    }
    var perpare = "\u4f60\u76ee\u524d\u6b63\u4f4d\u4e8e";
    perpare = reconvert(perpare);
    if(type == 1)
    {
        var fcfsp = "\u5148\u5230\u5148\u670d\u52a1\u7b97\u6cd5";
        fcfsp = reconvert(fcfsp);
        this.cmd("SetText", this.theStaus, perpare + fcfsp);
        this.cmd("Step");
    }
    else if(type == 2){
        var sjfp = "\u77ed\u4f5c\u4e1a\u4f18\u5148\u7b97\u6cd5";
        sjfp = reconvert(sjfp);
        this.cmd("SetText", this.theStaus, perpare + sjfp);
        this.cmd("Step");
    }
    else if(type == 3){
        var psap = "\u4f18\u5148\u7ea7\u8c03\u5ea6\u7b97\u6cd5";
        psap = reconvert(psap)
        this.cmd("SetText", this.theStaus, perpare + psap);
        this.cmd("Step");
    }
    else if(type == 4)
    {
        var hrrnp = "\u9ad8\u54cd\u5e94\u6bd4\u4f18\u5148\u8c03\u5ea6\u7b97\u6cd5";
        hrrnp = reconvert(hrrnp);
        this.cmd("SetText", this.theStaus, perpare + hrrnp);
        this.cmd("Step");
    }
    else if(type == 5)
    {
        var rrp = "\u65f6\u95f4\u7247\u8f6e\u8f6c\u8c03\u5ea6\u7b97\u6cd5";
        rrp = reconvert(rrp)
        this.cmd("SetText", this.theStaus, perpare + rrp);
        this.cmd("Step");
    }
    this.animationManager.StartNewAnimation(this.commands);
   // console.log(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

//set the size of the array
ProcessScheduling.prototype.setArraySize = function () {
    //
    this.array_size = ARRAY_SIZE_SMALL;
    this.array_width = ARRAY_WIDTH_SMALL;
    this.array_height = ARRAY_HEIGHT_SMALL;
    this.array_bar_width = ARRAY_BAR_WIDTH_SMALL;
    this.array_initial_x = ARRAY_INITIAL_X_SMALL;
    this.array_y_pos = ARRAY_Y_POS;
    this.array_label_y_pos = ARRAY_LABEL_Y_POS;
    this.showLabels = true;
}

//随机不重复数组
function createRandomArr(l, st, ed){
    var r = [];
    var o = {};
    var a;
    for (var i = 0;i < l;i++){
        a = Math.floor(st + Math.random()*ed);
        o[a] ? i-- : (r.push(a),o[a] = true);
    }

    return r;
}
