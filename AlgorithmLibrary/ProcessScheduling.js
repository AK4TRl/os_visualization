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
var ARRAY_WIDTH_SMALL = 160;
var ARRAY_BAR_WIDTH_SMALL = 160;
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
    this.cmd("SetText", this.theStaus, "Pls choose the type in the left slide.");

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
    var task6 = "\u8f6e\u8f6c\u8c03\u5ea6\u7b97\u6cd5";
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
    var description = "\u5148\u6765\u5148\u670d\u52a1\u8c03\u5ea6\u7b97\u6cd5\u662f" +
        "\u4e00\u79cd\u6700\u7b80\u5355\u7684\u65b9\u6cd5\uff0c\u7cfb\u7edf\u7ef4\u62a4" +
        "\u4e00\u4e2a\u0046\u0049\u0046\u004f\u961f\u5217\uff0c\u6309\u7167\u8fdb\u7a0b" +
        "\u5230\u8fbe\u5c31\u7eea\u961f\u5217\u7684\u5148\u540e\u6b21\u5e8f\u987a\u5e8f" +
        "\u8c03\u5ea6\u8fd0\u884c\u3002";
    description = reconvert(description);
    var p = "\u0031\u002e\u6309\u5347\u5e8f\u6392\u5217\u5c31\u7eea\u65f6\u95f4";
    p = reconvert(p);
    var p2 = "\u0032\u002e\u540e\u6765\u7684\u6309\u5230\u8fbe\u65f6\u95f4\u7684\u5148" +
        "\u540e\u6392\u5728\u5c31\u7eea\u961f\u5217\u4e0a\uff0c\u6bcf\u6b21\u53d6\u961f" +
        "\u9996\u5143\u7d20\u8fd0\u884c\u3002";
    p2 = reconvert(p2);
    addLabelToAlgorithmBar(description);
    addLabelToAlgorithmBar(p+"\n"+p2);

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

    for (var i = 0; i < this.recordProcess.length; ++i)
    {
        if(this.recordProcess[i].readyTime < FinishTime) //没有作业正在运行，取队首作业运行
            this.recordProcess[i].FinishTime = this.recordProcess[i - 1].FinishTime + this.recordProcess[i].ServerTime;
        else                                  //有作业正在运行，等待作业完毕，此作业再运行
            this.recordProcess[i].FinishTime = this.recordProcess[i].readyTime + this.recordProcess[i].ServerTime;

        this.recordProcess[i].TurnoverTime = this.recordProcess[i].FinishTime - this.recordProcess[i].readyTime;
        this.recordProcess[i].WeightedTurnoverTime = (this.recordProcess[i].TurnoverTime / this.recordProcess[i].ServerTime).toFixed(2);
        FinishTime = this.recordProcess[i].FinishTime;
    }
    tmpProcess = [0,1,2,3,4,5,6,7,8,9,10,11];
    for(var i = 0; i < this.recordProcess.length; ++i)
    {
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 2, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");
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
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 9) {
        this.sjfStartButton = addControlToAnimationBar("Button", "sjfStart");
        this.sjfStartButton.onclick = this.sjfStarttButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.sjfStartButton = addControlToAnimationBar("Button", "sjfStart");
        this.sjfStartButton.onclick = this.sjfStarttButtonCallback.bind(this);
    }
    var sjfdescription = "\u6700\u77ed\u4f5c\u4e1a\u4f18\u5148\u8c03\u5ea6\u6cd5\u8981\u6c42\u6bcf\u4e2a\u4f5c\u4e1a\u7684\u8fdb\u7a0b\u63d0\u4f9b\u6240\u9700\u7684\u8fd0\u884c\u65f6\u95f4\uff0c\u6bcf\u6b21\u8c03\u5ea6\u4e8b\u603b\u662f\u9009\u53d6\u8fd0\u884c\u65f6\u95f4\u6700\u77ed\u7684\u8fdb\u7a0b\u8fd0\u884c\u3002\u8fd9\u79cd\u7b97\u6cd5\u5bf9\u4e8e\u8fd0\u884c\u65f6\u95f4\u77ed\u7684\u8fdb\u7a0b\u6709\u5229\uff0c\u8fdb\u7a0b\u7684\u5e73\u5747\u7b49\u5f85\u548c\u5468\u8f6c\u65f6\u95f4\u6700\u4f73\u3002";
    sjfdescription = reconvert(sjfdescription);
    addLabelToAlgorithmBar(sjfdescription);
    addLabelToAlgorithmBar("label 2");
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
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 2, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");
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
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 9) {
        this.psaStartButton = addControlToAnimationBar("Button", "psaStart");
        this.psaStartButton.onclick = this.psaStarttButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.psaStartButton = addControlToAnimationBar("Button", "psaStart");
        this.psaStartButton.onclick = this.psaStarttButtonCallback.bind(this);
    }
    var psadescription = "\u4f5c\u4e3a\u6700\u5e38\u7528\u7684\u4e00\u79cd\u8c03\u5ea6\u65b9\u6cd5\uff0c\u7cfb\u7edf\u603b\u662f\u5c06\u0043\u0050\u0055\u5206\u914d\u7ed9\u5c31\u7eea\u961f\u5217\u4e2d\u4f18\u5148\u7ea7\u6700\u9ad8\u7684\u8fdb\u7a0b\u3002";
    psadescription = reconvert(psadescription);
    addLabelToAlgorithmBar(psadescription);
    addLabelToAlgorithmBar("label 4");
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
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 2, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 2, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 6, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");
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
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 9) {
        this.hrrnStartButton = addControlToAnimationBar("Button", "hrrnStart");
        this.hrrnStartButton.onclick = this.hrrnStarttButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.hrrnStartButton = addControlToAnimationBar("Button", "hrrnStart");
        this.hrrnStartButton.onclick = this.hrrnStarttButtonCallback.bind(this);
    }
    addLabelToAlgorithmBar("label 3");
    addLabelToAlgorithmBar("label 4");
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
        Process[i].level = parseFloat(((Process[i].ServerTime + (0 - Process[i].readyTime)) / Process[i].ServerTime).toFixed(2)) * 100;
    }
    Process.sort(by('readyTime',des('level')));
    for(var i = 0; i < Process.length; ++i) {
        Process[i].level = parseFloat(Process[i].level) / 100;
    }

    console.log(Process);

    var FinishTime = -1;
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

        for(var l = i + 1; l < i + j; ++l) {
            this.recordProcess[l].level = parseFloat(((this.recordProcess[l].ServerTime + (FinishTime - this.recordProcess[l].readyTime)) / this.recordProcess[l].ServerTime).toFixed(2));
        }
        // TODO: 浮点数的比较
        var newArray = [];
        newArray = this.recordProcess.slice(i + 1, i + j);
        for(var l = 0; l < newArray.length; ++l){
            newArray[l].level = parseFloat(newArray[l].level) * 100;
        }
        newArray.sort(by('readyTime',des('level')));
        console.log(newArray);

        var Count = 0;
        for(var l = i + 1; l <= (i + j - 1); ++l){
            this.recordProcess[l] = newArray[Count++];
        }
    }

    tmpProcess = [0,1,2,3,4,5,6,7,8,9,10,11];
    for(var i = 0; i < this.recordProcess.length; ++i)
    {
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 6, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 6, "#fff");
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 7, this.recordProcess[i].level);
        this.cmd("Step");
        //开始时间
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 6, "#fff");
        this.cmd("SetBackgroundColor", this.recordProcess[i].pid * 16 + 8, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetText", this.recordProcess[i].pid * 16 + 9, this.recordProcess[i].readyTime);
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
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 9) {
        this.rrStartButton = addControlToAnimationBar("Button", "rrStart");
        this.rrStartButton.onclick = this.rrStarttButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.rrStartButton = addControlToAnimationBar("Button", "rrStart");
        this.rrStartButton.onclick = this.rrStarttButtonCallback.bind(this);
    }
    addLabelToAlgorithmBar("label 7");
    addLabelToAlgorithmBar("label 8");
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

    while (tmpProcess.length != 0 || Ready.length != 0)
    {
        if (tmpProcess.length != 0 && BeginTime >= tmpProcess[tmpProcess.length - 1].readyTime)    //有新作业到达，加入就绪队列
        {
            Ready.push(tmpProcess[tmpProcess.length - 1]);
            tmpProcess.pop();
        }
        else if(Ready.length == 0 && tmpProcess.length != 0 && BeginTime < tmpProcess[tmpProcess.length - 1].readyTime){
            BeginTime = tmpProcess[tmpProcess.length - 1].readyTime;
            continue;
        }
        if (Ready[Ready.length - 1].FinishTime + timeslice < Ready[Ready.length - 1].ServerTime)     //时间片用完没运行完,加入队尾
        {
            Ready[Ready.length - 1].FinishTime += timeslice;
            Ready.unshift(Ready[Ready.length - 1]);
            Ready.pop();
            BeginTime += timeslice;
        }
        else        //此作业运行完
        {
            BeginTime += (Ready[Ready.length - 1].ServerTime - Ready[Ready.length - 1].FinishTime);
            Ready[Ready.length - 1].FinishTime = BeginTime;
            Ready[Ready.length - 1].TurnoverTime = Ready[Ready.length - 1].FinishTime - Ready[Ready.length - 1].readyTime;
            Ready[Ready.length - 1].WeightedTurnoverTime = (parseFloat(Ready[Ready.length - 1].TurnoverTime) / parseFloat(Ready[Ready.length - 1].ServerTime)).toFixed(2);

            //从就绪队列中移除作业
            result.push(Ready[Ready.length - 1]);
            Ready.pop();
        }
    }
    console.log(tmpProcess);
    console.log(result);

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
    console.log(this.readyTime);
    if(type == 1)
    {
        this.cmd("SetText", this.theStaus, "u are in the FCFS section.");
        this.cmd("Step");
    }
    else if(type == 2){
        this.cmd("SetText", this.theStaus, "u are in the SJF section.");
        this.cmd("Step");
    }
    else if(type == 3){
        this.cmd("SetText", this.theStaus, "u are in the PSA section.");
        this.cmd("Step");
    }
    else if(type == 4)
    {
        this.cmd("SetText", this.theStaus, "u are in the HRRN section.");
        this.cmd("Step");
    }
    else if(type == 5)
    {
        this.cmd("SetText", this.theStaus, "u are in the RR section.");
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
