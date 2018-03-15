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
    this.readyTime = new Array(100);
    this.processNameIndex = new Array(100);
    this.ServerTime = new Array(100);
    this.priority = new Array(100);
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
    this.returnButton = addControlToAlgorithmBar("Button", "Return");
    this.returnButton.onclick = this.returnCallback.bind(this);

    //先到先服务算法（FCFS）
    this.fcfsButton = addControlToAlgorithmBar("Button", "FCFS");
    this.fcfsButton.onclick = this.fcfsCallback.bind(this);

    //短作业优先算法（SJF）
    this.sjfButton = addControlToAlgorithmBar("Button","SJF");
    this.sjfButton.onclick = this.sjfCallback.bind(this);

    //优先级调度算法（PSA）
    this.psaButton = addControlToAlgorithmBar("Button","PSA");
    this.psaButton.onclick = this.psaCallback.bind(this);

    //高响应比优先调度算法（HRRN）
    this.hrrnButton = addControlToAlgorithmBar("Button","HRRN");
    this.hrrnButton.onclick = this.hrrnCallback.bind(this);

    //轮转调度算法（RR）
    this.rrButton = addControlToAlgorithmBar("Button","RR");
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
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 12) {
        this.fcfsStartButton = addControlToAnimationBar("Button", "fcfsStart");
        this.fcfsStartButton.onclick = this.fcfsStartButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.fcfsStartButton = addControlToAnimationBar("Button", "fcfsStart");
        this.fcfsStartButton.onclick = this.fcfsStartButtonCallback.bind(this);
    }
    addLabelToAlgorithmBar("Hello, everyone. Please allow me to introduce myself. I am a student of grade five. My favourite subject is English. I have some good friends and we go to school together. I like to make friends. Would you like to make friends with me?");
    addLabelToAlgorithmBar("label 3");

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
    //先排序
    //
    Process.sort(by('readyTime',by('ServerTime')));
    var smallestIndex = 1;
    var panding = 0, IndexToContinue = 0, flagIndex = 0;
    var endTime = 0;
    var tmpProcess = new Array();
    while(panding < this.array_size){
        var minnRDT = 999, theMinnNum = 0;
        this.recordProcess = new Array();
        for (var i = 0; i < this.array_size; ++i)
        {
            //this.cmd("SetForegroundColor", this.barLabels[smallestIndex], HIGHLIGHT_BAR_COLOR);
            if(this.readyTime[i] != " ") {
                this.cmd("SetBackgroundColor", this.barObjects[i] - 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("Step");
            }
            if (minnRDT >= this.readyTime[i] && this.readyTime[i] != " ") {
                this.cmd("SetBackgroundColor", this.barObjects[flagIndex] - 12, "#fff");
                //console.log(minnRDT + " " + Process[i].readyTime + " " + i);
                //console.log(this.barObjects[flagIndex] - 12);
                this.cmd("SetBackgroundColor", this.barObjects[i] - 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                flagIndex = i;
                minnRDT = this.readyTime[i];
                tmpProcess[theMinnNum++] = i;
            }
            else
                this.cmd("SetBackgroundColor", this.barObjects[i] - 12, "#fff");
            /*if(minnRDT == Process[i].readyTime){
             //
             ChangeOrNot = true;
             this.recordProcess[theSameNum++] = i;
             this.cmd("SetBackgroundColor", this.barObjects[i] - 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
             }*/
            //this.cmd("move", this.barObjects[i] - 12, 160 , 150,320,200);
            //this.cmd("SetBackgroundColor", this.barObjects[i]-12, "#fff");
            smallestIndex += 8;
        }
        this.cmd("Step");
        var theSameNum = 0;
        for (var j = tmpProcess.length - 1; j >= 0; j--) {
            if (this.readyTime[tmpProcess[j]] == minnRDT) {
                this.recordProcess[theSameNum++] = tmpProcess[j];
                this.readyTime[tmpProcess[j]] = " ";
            }
        }
        panding += theSameNum;
        console.log(Process);
        //console.log(this.commands);
        console.log("thesame num: " + theSameNum);
        if (theSameNum > 1) {
            this.cmd("SetBackgroundColor", this.barObjects[flagIndex] - 12, "#fff");
            var i;
            for (i = IndexToContinue; i < (IndexToContinue + theSameNum); ++i) {
                //
                this.cmd("SetBackgroundColor", Process[i].pid * 16, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 2, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 4, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 6, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 8, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 10, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 14, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("Step");
            }
            for (i = IndexToContinue; i < (IndexToContinue + theSameNum); ++i) {
                //
                this.cmd("SetBackgroundColor", Process[i].pid * 16, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 2, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 4, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 6, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 8, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 10, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 12, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 14, "#fff");
            }
            for (i = IndexToContinue; i < (IndexToContinue + theSameNum); ++i) {
                if(endTime < Process[i].readyTime)
                    endTime = Process[i].readyTime;
                //开始时间
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 2, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 8, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetText", Process[i].pid * 16 + 9, endTime);
                this.cmd("Step");
                //结束时间
                endTime += Process[i].ServerTime
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 8, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 10, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetText", Process[i].pid * 16 + 11, endTime);
                this.cmd("Step");
                //周转时间
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 10, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetText", Process[i].pid * 16 + 13, endTime - Process[i].readyTime);
                this.cmd("Step");
                //带权周转时间
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 12, "#fff");
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 14, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                this.cmd("SetText", Process[i].pid * 16 + 15, ((endTime - Process[i].readyTime)/endTime).toFixed(2));
                this.cmd("SetBackgroundColor", Process[i].pid * 16 + 14, "#fff");
                this.cmd("Step");
            }
            IndexToContinue = i;
        }
        else {
            if(endTime < Process[IndexToContinue].readyTime)
                endTime = Process[IndexToContinue].readyTime;
            //开始时间
            this.cmd("SetBackgroundColor", Process[IndexToContinue].pid * 16 + 2, "#fff");
            this.cmd("SetBackgroundColor", Process[IndexToContinue].pid * 16 + 8, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText", Process[IndexToContinue].pid * 16 + 9, endTime);
            this.cmd("Step");
            //结束时间
            endTime += Process[IndexToContinue].ServerTime
            this.cmd("SetBackgroundColor", Process[IndexToContinue].pid * 16 + 8, "#fff");
            this.cmd("SetBackgroundColor", Process[IndexToContinue].pid * 16 + 10, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText", Process[IndexToContinue].pid * 16 + 11, endTime);
            this.cmd("Step");
            //周转时间
            this.cmd("SetBackgroundColor", Process[IndexToContinue].pid * 16 + 10, "#fff");
            this.cmd("SetBackgroundColor", Process[IndexToContinue].pid * 16 + 12, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText", Process[IndexToContinue].pid * 16 + 13, endTime - Process[IndexToContinue].readyTime);
            this.cmd("Step");
            //带权周转时间
            this.cmd("SetBackgroundColor", Process[IndexToContinue].pid * 16 + 12, "#fff");
            this.cmd("SetBackgroundColor", Process[IndexToContinue].pid * 16 + 14, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText", Process[IndexToContinue].pid * 16 + 15, ((endTime - Process[IndexToContinue].readyTime)/Process[IndexToContinue].ServerTime).toFixed(2));
            this.cmd("SetBackgroundColor", Process[IndexToContinue].pid * 16 + 14, "#fff");
            this.cmd("Step");
            IndexToContinue++;
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
    if(f.getElementsByTagName("td").length < 12) {
        this.sjfStartButton = addControlToAnimationBar("Button", "sjfStart");
        this.sjfStartButton.onclick = this.sjfStarttButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.sjfStartButton = addControlToAnimationBar("Button", "sjfStart");
        this.sjfStartButton.onclick = this.sjfStarttButtonCallback.bind(this);
    }
    addLabelToAlgorithmBar("label 1");
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
    if(f.getElementsByTagName("td").length < 12) {
        this.psaStartButton = addControlToAnimationBar("Button", "psaStart");
        this.psaStartButton.onclick = this.psaStarttButtonCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.psaStartButton = addControlToAnimationBar("Button", "psaStart");
        this.psaStartButton.onclick = this.psaStarttButtonCallback.bind(this);
    }
    addLabelToAlgorithmBar("label 3");
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
    if(f.getElementsByTagName("td").length < 12) {
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
    if(f.getElementsByTagName("td").length < 12) {
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
    var timeslice = 20;
    Process.sort(by('readyTime'));
    for(var i = 0; i < Process.length; ++i){
        tmpProcess.unshift(Process[i]);
    }
    console.log(tmpProcess);

    var result = new Array(), Ready = new Array();
    var BeginTime = tmpProcess[tmpProcess.length - 1].readyTime;
    Ready.unshift(tmpProcess[tmpProcess.length - 1]);
    tmpProcess.pop();
    console.log(tmpProcess);
    while (tmpProcess.length != 0 || !Ready.empty())
    {
        if (tmpProcess.length != 0 && BeginTime >= tmpProcess[tmpProcess.length - 1].readyTime)    //有新作业到达，加入就绪队列
        {
            Ready.unshift(tmpProcess[tmpProcess.length - 1]);
            tmpProcess.pop();
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
            BeginTime += Ready[Ready.length - 1].ServerTime - Ready[Ready.length - 1].FinishTime;
            Ready[Ready.length - 1].FinishTime = BeginTime;
            Ready[Ready.length - 1].TurnoverTime = Ready[Ready.length - 1].FinishTime - Ready[Ready.length - 1].readyTime;
            Ready[Ready.length - 1].WeightedTurnoverTime = (parseFloat(Ready[Ready.length - 1].TurnoverTime) / parseFloat(Ready[Ready.length - 1].ServerTime)).toFixed(2);

            //从就绪队列中移除作业
            result.push(Ready[Ready.length - 1]);
            Ready.pop();
        }
    }

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

    for(var i = 0; i < this.array_size; ++i){
        var item = {};
        this.readyTime[i] = Math.floor(1 + Math.random()*30);
        this.ServerTime[i] = Math.floor(1 + Math.random()*10);
        this.priority[i] = Math.floor(1 + Math.random()*5);
        item.pid = i + 1;
        item.readyTime = this.readyTime[i];
        item.ServerTime = this.ServerTime[i];
        item.priority = this.priority[i];
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

