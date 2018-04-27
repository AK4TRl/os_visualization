/**
 * Created by AK4TRL on 2017/10/12.
 */

var curBanker;
var canvas;

var ARRAY_SIZE_SMALL = 5;
var ARRAY_WIDTH_SMALL = 250;
var ARRAY_BAR_WIDTH_SMALL = 320;
var ARRAY_HEIGHT_SMALL = 50;
var ARRAY_INITIAL_X_SMALL = 208;

var ARRAY_Y_POS = 100;
var ARRAY_LABEL_Y_POS = 175;

var LOWER_ARRAY_Y_POS = 500;
var LOWER_ARRAY_LABEL_Y_POS = 510;

var SCALE_FACTOR = 2.0;

var BAR_FOREGROUND_COLOR = "#000";
var BAR_BACKGROUND_COLOR ="#FFF";
var INDEX_COLOR = "#000";
var HIGHLIGHT_BAR_BACKGROUND_COLOR = "#FFAAAA";

var Banker = function (am, w, h) {
    this.init(am, w, h);
}
Banker.prototype = new Algorithm();
Banker.prototype.constructor = Banker;
Banker.superclass = Algorithm.prototype;

Banker.MESSAGE_X = 35;
Banker.MESSAGE_Y = 688;
Banker.MESSAGE_ID = 0;

function init() {
    var animManag = initCanvas("Banker");
    curBanker = new Banker(animManag, canvas.width, canvas.height);
}

//Banker继承算法基类与其本身构造
Banker.prototype.init = function (am, w, h) {

    Banker.superclass.init.call(this,am);

    this.Available = [];
    this.Max = [];
    this.Allocation = [];
    this.UseForAllocation = [];
    this.Need = [];
    this.safe = [];
    this.FreeAndAllocation = [];
    this.request = new Array(5);

    this.ProcessIdIndex = [];
    this.theStausIndex = new Array();
    this.theFreeAndAllocationIndex = new Array();
    this.theNeedIndex = new Array();
    this.theAvailableIndex = new Array();

    this.claimNum = 0;
    this.AllocatedNum = 0;
    this.theRequestProcessID = 0;
    this.addControls();
    this.nextIndex = 1;
    this.SetClaimTextIndex = 23;
    this.SetAllocatedTextIndex = 27;
    this.setArraySize();
    this.commands = [];
    //create random visual objects
    this.createVisualObjects();
}
//创建表格和label组件
Banker.prototype.createVisualObjects = function(){

    this.insertField.disabled = false;
    this.insertButton.disabled = false;
    this.ClaiminsertField.disabled = false;
    this.ClaiminsertButton.disabled = false;
    this.AllocatedinsertField.disabled = false;
    this.AllocatedinsertButton.disabled = false;

    this.barObjects = new Array(this.array_size);
    this.oldBarObjects= new Array(this.array_size);
    this.oldbarLabels= new Array(this.array_size);

    this.barLabels = new Array(this.array_size);
    this.barPositionsY = new Array(this.array_size);
    this.oldData = new Array(this.array_size);
    this.obscureObject  = new Array(this.array_size);

    var xPos = this.array_initial_x - 30;
    var yPos = this.array_y_pos;
    var yLabelPos = this.array_label_y_pos;

    this.commands = new Array();
    //console.log(this.array_size);
    var labelCount = 0;
    /*进程/资源*/
    this.cmd("CreateGrid", this.nextIndex++, "", this.array_bar_width / 2 , 86, xPos, yPos+ 6, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "", xPos, yPos);
    this.barLabels[labelCount++] = this.nextIndex++;


    /*标签*/
    for(var i = 1; i < 6; ++i) {
        if(i != 5) {
            this.cmd("CreateGrid", this.nextIndex++, "", this.array_bar_width / 2, 36, xPos * (i + 1), yPos - 19, "center", "center");
            this.cmd("CreateLabel", this.nextIndex, "", xPos * (i + 1), yPos - 20);
            this.barLabels[labelCount++] = this.nextIndex++;
        }
        else{
            /*Finish*/
            this.cmd("CreateGrid", this.nextIndex++, "", this.array_bar_width / 2 , 86, xPos * (i + 1), yPos+6, "center", "center");
            this.cmd("CreateLabel", this.nextIndex, "", xPos * (i + 1), yPos - 20);
            this.barLabels[labelCount++] = this.nextIndex++;
        }
    }
    xPos += 118;

    /*R1-R16*/
    for(var i = 1; i < 17; ++i){
        this.cmd("CreateGrid", this.nextIndex++, "", this.array_bar_width / 8, 50, xPos, yPos+25, "center", "center");
        this.cmd("CreateLabel", this.nextIndex, "", xPos, yPos+25);
        this.barLabels[labelCount++] = this.nextIndex++;
        if(i % 4 == 0)
            xPos += 18;
        xPos+=40;
    }

    //Create a cmd to give to the animation manager
    for (var i = 0; i < this.array_size; i++)
    {
        //xPos = xPos + this.array_width;
        xPos = this.array_initial_x;
        yPos = yPos + this.array_height;
        //console.log("ps of yLabelPos:" + yLabelPos);
        this.barPositionsY[i] = yPos;

        this.cmd("CreateGrid", this.nextIndex, "", this.array_bar_width / 2, 50,  xPos - 30, yPos + 25, "center", "center");
        this.cmd("SetForegroundColor", this.nextIndex, BAR_FOREGROUND_COLOR);
        this.cmd("SetBackgroundColor", this.nextIndex, BAR_BACKGROUND_COLOR);
        this.barObjects[i] = this.nextIndex;
        this.nextIndex += 1;
        this.cmd("CreateLabel", this.nextIndex, "0",  xPos - 30, yPos + 25);
        this.cmd("SetForegroundColor", this.nextIndex, INDEX_COLOR);
        this.barLabels[labelCount++] = this.nextIndex;
        ++this.nextIndex;

        xPos+=88;

        for(var j = 1; j < 17; ++j) {
            this.cmd("CreateGrid", this.nextIndex, "", this.array_bar_width / 8, 50, xPos, yLabelPos + 25, "center", "bottom");
            //this.cmd("CreateRectangle", this.nextIndex, "", this.array_bar_width, 200, xPos, yPos,"center","bottom");
            this.cmd("SetForegroundColor", this.nextIndex, BAR_FOREGROUND_COLOR);
            this.cmd("SetBackgroundColor", this.nextIndex, BAR_BACKGROUND_COLOR);
            this.barObjects[i] = this.nextIndex++;
            //this.oldBarObjects[i] = this.barObjects[i];
            this.cmd("CreateLabel", this.nextIndex, "0", xPos, yLabelPos);
            this.cmd("SetForegroundColor", this.nextIndex, INDEX_COLOR);
            //console.log("the barlabels's id :" + this.nextIndex);
            this.barLabels[labelCount++] = this.nextIndex;
            if(j % 4 == 0)
                xPos += 18;
            xPos += 40;
            ++this.nextIndex;
        }

        this.cmd("CreateGrid", this.nextIndex, "",  this.array_bar_width / 2, 50, xPos + 60,yLabelPos, "center", "center");
        this.cmd("SetForegroundColor", this.nextIndex, BAR_FOREGROUND_COLOR);
        this.cmd("SetBackgroundColor", this.nextIndex, BAR_BACKGROUND_COLOR);
        this.barObjects[i] = this.nextIndex;
        this.nextIndex ++;
        this.cmd("CreateLabel", this.nextIndex, "0", xPos + 60, yLabelPos);
        this.cmd("SetForegroundColor", this.nextIndex, INDEX_COLOR);
        this.barLabels[labelCount++] = this.nextIndex;
        ++this.nextIndex;

        yLabelPos += 50;
    }

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_bar_width - 40, 50, 500 ,500, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "", 500, 500);
    this.barLabels[labelCount++] = this.nextIndex++;

    yPos = 550;

    /*初始资源R1-R4*/
    for(var j = 0; j < 2; ++j) {
        xPos = 450;
        for (var i = 0; i < 4; ++i) {
            this.cmd("CreateGrid", this.nextIndex++, "", 70, 50, xPos - 55, yPos, "center", "center");
            this.cmd("CreateLabel", this.nextIndex, "", xPos - 50, yPos);
            this.barLabels[labelCount++] = this.nextIndex++;
            xPos += 70;
        }
        yPos += 50;
    }


    /*请求资源*/
    this.cmd("CreateGrid", this.nextIndex++, "", this.array_bar_width / 2, 100, 800 ,525, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "", 800, 525);
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_bar_width / 2, 50,  800, 625, "center", "bottom");
    this.cmd("CreateLabel", this.nextIndex, "", 800, 600);
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateGrid", this.nextIndex++, "", 240, 50, 1000 ,500, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "", 1000, 500);
    this.barLabels[labelCount++] = this.nextIndex++;

    yPos = 550;

    for(var j = 0; j < 2; ++j) {
        xPos = 910;
        for (var i = 0; i < 4; ++i) {
            this.cmd("CreateGrid", this.nextIndex++, "", 60, 50, xPos, yPos, "center", "center");
            this.cmd("CreateLabel", this.nextIndex, "", xPos, yPos);
            this.barLabels[labelCount++] = this.nextIndex++;
            xPos += 60;
        }
        yPos += 50;
    }


    this.cmd("CreateLabel", 0, " ", Banker.MESSAGE_X, Banker.MESSAGE_Y,0);
    this.cmd("SetText", 0, "请按照从左到右的顺序输入相关资源。");

    this.cmd("CreateLabel", this.nextIndex, " ", Banker.MESSAGE_X + 200, Banker.MESSAGE_Y + 60,0);
    this.cmd("SetText", this.nextIndex, "注：前三个资源输入格式为每个资源数以空格区分，如 x x x x，请求资源格式在前面基础上加上请求目的进程 Px x x x x");
    this.cmd("SetTextColor", this.nextIndex, "#EE0000");

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
Banker.prototype.addControls = function () {

    //返回主页
    this.returnButton = addControlToAlgorithmBar("Button", "返回主页");
    this.returnButton.onclick = this.returnCallback.bind(this);

    //reset
    this.adButton = addControlToAlgorithmBar("Button", "算法介绍");
    this.adButton.onclick = this.adCallback.bind(this);

    //reset
    this.resetButton = addControlToAlgorithmBar("Button", "重置");
    this.resetButton.onclick = this.resetCallback.bind(this);

    //可用资源按钮及文本框
    this.insertField = addBankerInput("Text", "Available",0);
    var taska = "\u53ef\u7528\u8d44\u6e90\u8f93\u5165";
    taska = reconvert(taska);
    this.insertButton = addBankerButton("Button", taska);
    this.insertButton.onclick = this.insertCallback.bind(this);

    //已有资源按钮及文本框
    this.ClaiminsertField = addBankerInput("Text", "Max",1);

    this.ClaiminsertButton = addBankerButton("Button", "最大资源输入");
    this.ClaiminsertButton.onclick = this.ClaiminsertCallback.bind(this);

    //需要资源按钮及文本框
    this.AllocatedinsertField = addBankerInput("Text", "Allocated",1);

    this.AllocatedinsertButton = addBankerButton("Button", "已分配资源输入");
    this.AllocatedinsertButton.onclick = this.AllocatedinsertCallback.bind(this);

    //请求资源按钮及文本框
    this.RequestinsertField = addBankerInput("Text", "Request",1);
    var taskd = "\u8bf7\u6c42\u8d44\u6e90\u8f93\u5165";
    taskd = reconvert(taskd);
    this.RequestinsertButton = addBankerButton("Button", taskd);
    this.RequestinsertButton.onclick = this.RequestinsertCallback.bind(this);

    var task1 = "\u94f6\u884c\u5bb6\u7b97\u6cd5\u5f00\u59cb";
    task1 = reconvert(task1);
    //start
    var f = document.getElementById("GeneralAnimationControls");
    var childs = f.childNodes;
    if(f.getElementsByTagName("td").length < 9) {
        this.BankerStartButton = addControlToAnimationBar("Button", task1);
        this.BankerStartButton.onclick = this.BankerStartCallback.bind(this);
    }
    else {
        f.removeChild(childs[parseInt(f.getElementsByTagName("td").length-2)]);
        this.BankerStartButton = addControlToAnimationBar("Button", task1);
        this.BankerStartButton.onclick = this.BankerStartCallback.bind(this);
    }
}
Banker.prototype.adCallback = function () {
    addLabelToAlgorithmBar("银行家算法是一种最有代表性的避免死锁的算法。" +
        "在避免死锁方法中允许进程动态地申请资源，但系统在进行资源分配之前，应先计算此次分配资源的安全性，若分配不会导致系统进入不安全状态，则分配，否则等待。" +
        "建议请求资源输入数据为小于或等于可用资源和需求资源。");
    addLabelToAlgorithmBar("①.如果Requests[i] <= Need[i]，则转到第二步。否则，返回不能通过。这一步是控制进程申请的资源不得大于需要的资源" +
        " ②.如果Requests[i] <= Available，则转到第三步，否则Pi等待资源。③.满足前两步，调用安全判定算法，检查是否安全。");
}

Banker.prototype.BankerStartCallback = function (event) {
    this.implementAction(this.BankerStart.bind(this),0);
}
Banker.prototype.BankerStart = function(){

    this.commands = new Array();
    //
    this.cmd("SetText",0,"比较请求进程的资源和目的资源所需要的资源数量，当前请求进程为pid" + this.theRequestProcessID + "。");
    this.cmd("Step");
    this.cmd("SetBackgroundColor", this.ProcessIdIndex[this.theRequestProcessID - 1], HIGHLIGHT_BAR_BACKGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.ProcessIdIndex[this.ProcessIdIndex.length - 1], HIGHLIGHT_BAR_BACKGROUND_COLOR);
    console.log(this.request);

    this.tmpNeed = this.Need.slice();
    this.tmpAvailable = this.Available.slice();
    this.tmpAllocation = this.Allocation.slice();

    /*check the need and the request*/
    console.log(this.tmpNeed);
    for(var i = 0; i < 4; ++i) {
        this.cmd("Step");
        this.cmd("SetText",0,"对比当前请求进程pid" + this.theRequestProcessID + "的请求资源数和还需要资源数的大小。");
        this.cmd("SetBackgroundColor", this.theNeedIndex[this.theRequestProcessID - 1][i] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");

        if(i == 0 && this.request[this.theRequestProcessID][i] > this.Need[this.theRequestProcessID - 1].R1){

            this.cmd("SetText",0,"当前请求资源R1大于还需请求资源R1。");
            this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#EE0000");

            return this.commands;
        }
        else if(i == 1 && this.request[this.theRequestProcessID][i] > this.Need[this.theRequestProcessID - 1].R2){
            this.cmd("SetText",0,"当前请求资源R2大于还需请求资源R2。");
            this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#EE0000");

            return this.commands;

        }
        else if(i == 2 && this.request[this.theRequestProcessID][i] > this.Need[this.theRequestProcessID - 1].R3){
            this.cmd("SetText",0,"当前请求资源R3大于还需请求资源R3。");
            this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#EE0000");

            return this.commands;

        }
        else if(i == 3 && this.request[this.theRequestProcessID][i] > this.Need[this.theRequestProcessID - 1].R4){
            this.cmd("SetText",0,"当前请求资源R4大于还需请求资源R4。");
            this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#EE0000");

            return this.commands;

        }
        else{
            this.cmd("Step");
            this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#008B00");
            this.cmd("SetText",0,"当前请求资源R"+ (i + 1) + "小于或等于还需请求资源数R" + (i + 1) + "。");
            this.cmd("Step");
            this.cmd("SetText",0,"下一个");
            this.cmd("Step");
        }
    }

    this.cmd("Step");
    this.cmd("SetText",0,"通过");

    for(var i = 0; i < 4; ++i){
        this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#fff");
        this.cmd("SetBackgroundColor", this.theNeedIndex[this.theRequestProcessID - 1][i] - 1, "#fff");
    }

    this.cmd("SetBackgroundColor", this.ProcessIdIndex[this.theRequestProcessID - 1], "#fff");
    this.cmd("SetBackgroundColor", this.ProcessIdIndex[this.ProcessIdIndex.length - 1], "#fff");

    /*check the Available and the request*/
    for(var i = 0; i < 4; ++i) {
        this.cmd("Step");
        this.cmd("SetText",0,"对比当前请求进程pid" + this.theRequestProcessID + "的请求资源数和剩余资源数的大小。");
        this.cmd("SetBackgroundColor", this.theAvailableIndex[i] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
        this.cmd("Step");

        if(i == 0 && this.request[this.theRequestProcessID][i] > this.Available[0].R1){
            this.cmd("SetText",0,"当前请求资源R1大于剩余资源数R1。");
            this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#EE0000");

            return this.commands;
        }
        else if(i == 1 && this.request[this.theRequestProcessID][i] > this.Available[0].R2){
            this.cmd("SetText",0,"当前请求资源R2大于剩余资源数R2。");
            this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#EE0000");

            return this.commands;

        }
        else if(i == 2 && this.request[this.theRequestProcessID][i] > this.Available[0].R3){
            this.cmd("SetText",0,"当前请求资源R3大于剩余资源数R3。");
            this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#EE0000");

            return this.commands;

        }
        else if(i == 3 && this.request[this.theRequestProcessID][i] > this.Available[0].R4){
            this.cmd("SetText",0,"当前请求资源R4大于剩余资源数R4。");
            this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#EE0000");

            return this.commands;

        }
        else{
            this.cmd("Step");
            this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#008B00");
            this.cmd("SetText",0,"当前请求资源R"+ (i + 1) + "小于或等于剩余资源数R" + (i + 1) + "。");
            this.cmd("Step");
            this.cmd("SetText",0,"下一个");
            this.cmd("Step");
        }
    }
    for(var i = 0; i < 4; ++i){
        this.cmd("SetBackgroundColor", this.barLabels[this.barLabels.length - 4 + i] - 1, "#fff");
        this.cmd("SetBackgroundColor", this.theAvailableIndex[i] - 1, "#fff");
    }
    this.cmd("Step");
    this.cmd("SetText",0,"通过");

    this.cmd("Step");
    //满足小于需要和可用，进行分配
    this.tmpAvailable[0].R1 = parseInt(this.tmpAvailable[0].R1) - parseInt(this.request[this.theRequestProcessID][0]);
    this.tmpAvailable[0].R2 = parseInt(this.tmpAvailable[0].R2) - parseInt(this.request[this.theRequestProcessID][1]);
    this.tmpAvailable[0].R3 = parseInt(this.tmpAvailable[0].R3) - parseInt(this.request[this.theRequestProcessID][2]);
    this.tmpAvailable[0].R4 = parseInt(this.tmpAvailable[0].R4) - parseInt(this.request[this.theRequestProcessID][3]);

    this.tmpAllocation[this.theRequestProcessID - 1].R1 = parseInt(this.tmpAllocation[this.theRequestProcessID - 1].R1) + parseInt(this.request[this.theRequestProcessID][0]);
    this.tmpAllocation[this.theRequestProcessID - 1].R2 = parseInt(this.tmpAllocation[this.theRequestProcessID - 1].R2) + parseInt(this.request[this.theRequestProcessID][1]);
    this.tmpAllocation[this.theRequestProcessID - 1].R3 = parseInt(this.tmpAllocation[this.theRequestProcessID - 1].R3) + parseInt(this.request[this.theRequestProcessID][2]);
    this.tmpAllocation[this.theRequestProcessID - 1].R4 = parseInt(this.tmpAllocation[this.theRequestProcessID - 1].R4) + parseInt(this.request[this.theRequestProcessID][3]);

    this.tmpNeed[this.theRequestProcessID - 1].R1 = parseInt(this.tmpNeed[this.theRequestProcessID - 1].R1) - parseInt(this.request[this.theRequestProcessID][0]);
    this.tmpNeed[this.theRequestProcessID - 1].R2 = parseInt(this.tmpNeed[this.theRequestProcessID - 1].R2) - parseInt(this.request[this.theRequestProcessID][1]);
    this.tmpNeed[this.theRequestProcessID - 1].R3 = parseInt(this.tmpNeed[this.theRequestProcessID - 1].R3) - parseInt(this.request[this.theRequestProcessID][2]);
    this.tmpNeed[this.theRequestProcessID - 1].R4 = parseInt(this.tmpNeed[this.theRequestProcessID - 1].R4) - parseInt(this.request[this.theRequestProcessID][3]);

    this.cmd("SetText",0,"进行安全检测。。。");
    this.cmd("Step");
    /*安全检测*/
    var check = this.SaveOrNot(this.commands);

    console.log(this.theFreeAndAllocationIndex);

    if(check) {
        this.cmd("SetText",0,"检测安全！正在进行分配。。。");
        this.cmd("Step");
        for(var j = 0; j < 5; ++j) {
            this.cmd("SetText",0,"进行分配。。。");
            for(var k = 0; k < 4; ++k){
                if(k == 0) {
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 9, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("SetText", this.theNeedIndex[this.safe[j]][k], 0);
                    this.cmd("SetText", this.theNeedIndex[this.safe[j]][k] - 8, this.tmpAllocation[this.safe[j]].R1 + this.tmpNeed[this.safe[j]].R1);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 1, "#fff");
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 9, "#fff");
                }
                else if(k == 1){
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 9, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("SetText", this.theNeedIndex[this.safe[j]][k], 0);
                    this.cmd("SetText", this.theNeedIndex[this.safe[j]][k] - 8, this.tmpAllocation[this.safe[j]].R2 + this.tmpNeed[this.safe[j]].R2);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 1, "#fff");
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 9, "#fff");
                }
                else if(k == 2){
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 9, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("SetText", this.theNeedIndex[this.safe[j]][k], 0);
                    this.cmd("SetText", this.theNeedIndex[this.safe[j]][k] - 8, this.tmpAllocation[this.safe[j]].R3 + this.tmpNeed[this.safe[j]].R3);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 1, "#fff");
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 9, "#fff");
                }
                else if(k == 3){
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 9, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("SetText", this.theNeedIndex[this.safe[j]][k], 0);
                    this.cmd("SetText", this.theNeedIndex[this.safe[j]][k] - 8, this.tmpAllocation[this.safe[j]].R4 + this.tmpNeed[this.safe[j]].R4);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 1, "#fff");
                    this.cmd("SetBackgroundColor", this.theNeedIndex[this.safe[j]][k] - 9, "#fff");
                }
            }

            this.cmd("Step");

            for (var i = 0; i < 4; ++i) {
                this.cmd("SetBackgroundColor", this.theFreeAndAllocationIndex[this.safe[j]][i] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                if (i == 0) {
                    this.cmd("SetText",0,"分配释放后的资源R13为已分配资源" + this.UseForAllocation[this.safe[j]].R1 + "+系统可用资源" + (this.FreeAndAllocation[this.safe[j]].R1 - this.UseForAllocation[0].R1) + "=" + this.FreeAndAllocation[this.safe[j]].R1);
                    this.cmd("Step");
                    this.cmd("SetText", this.theFreeAndAllocationIndex[this.safe[j]][i], this.FreeAndAllocation[this.safe[j]].R1);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theAvailableIndex[i] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("Step");
                    this.cmd("SetText", this.theAvailableIndex[i], this.FreeAndAllocation[this.safe[j]].R1);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theAvailableIndex[i] - 1, "#fff");
                }
                else if (i == 1) {
                    this.cmd("SetText",0,"分配释放后的资源R14为已分配资源" + this.UseForAllocation[this.safe[j]].R2 + "+系统可用资源" + (this.FreeAndAllocation[this.safe[j]].R2 - this.UseForAllocation[0].R2) + "=" + this.FreeAndAllocation[this.safe[j]].R2);
                    this.cmd("Step");
                    this.cmd("SetText", this.theFreeAndAllocationIndex[this.safe[j]][i], this.FreeAndAllocation[this.safe[j]].R2);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theAvailableIndex[i] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("Step");
                    this.cmd("SetText", this.theAvailableIndex[i], this.FreeAndAllocation[this.safe[j]].R2);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theAvailableIndex[i] - 1, "#fff");
                }
                else if (i == 2) {
                    this.cmd("SetText",0,"分配释放后的资源R15为已分配资源" + this.UseForAllocation[this.safe[j]].R3 + "+系统可用资源" + (this.FreeAndAllocation[this.safe[j]].R3 - this.UseForAllocation[this.safe[j]].R3) + "=" + this.FreeAndAllocation[this.safe[j]].R3);
                    this.cmd("Step");
                    this.cmd("SetText", this.theFreeAndAllocationIndex[this.safe[j]][i], this.FreeAndAllocation[this.safe[j]].R3);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theAvailableIndex[i] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("Step");
                    this.cmd("SetText", this.theAvailableIndex[i], this.FreeAndAllocation[this.safe[j]].R3);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theAvailableIndex[i] - 1, "#fff");
                }
                else if (i == 3) {
                    this.cmd("SetText",0,"分配释放后的资源R16为已分配资源" + this.UseForAllocation[this.safe[j]].R4 + "+系统可用资源" + (this.FreeAndAllocation[this.safe[j]].R4 - this.UseForAllocation[this.safe[j]].R4) + "=" + this.FreeAndAllocation[this.safe[j]].R4);
                    this.cmd("Step");
                    this.cmd("SetText", this.theFreeAndAllocationIndex[this.safe[j]][i], this.FreeAndAllocation[this.safe[j]].R4);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theAvailableIndex[i] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
                    this.cmd("Step");
                    this.cmd("SetText", this.theAvailableIndex[i], this.FreeAndAllocation[this.safe[j]].R4);
                    this.cmd("Step");
                    this.cmd("SetBackgroundColor", this.theAvailableIndex[i] - 1, "#fff");
                }
                this.cmd("Step");
            }

            this.cmd("SetBackgroundColor", this.theStausIndex[this.safe[j]] - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText", this.theStausIndex[this.safe[j]], "True");
            this.cmd("Step");
            this.cmd("SetBackgroundColor", this.theStausIndex[this.safe[j]] - 1, "#fff");
        }

        this.cmd("Step");
        console.log(this.FreeAndAllocation);
        console.log(this.theStausIndex);
        this.cmd("SetText", 0, "成功.");
        this.cmd("Step");
        this.cmd("SetText", 0, "存在一个安全队列为 {P"+(this.safe[0] + 1)+", P"+(this.safe[1]+1)+", P"+(this.safe[2]+1)+", P"+(this.safe[3]+1)+", P"+(this.safe[4]+1)+"}");
    }
    else{
        this.cmd("SetText",0,"失败.");
    }

    /*检测结束*/
    console.log(this.commands);

    return this.commands;
}
Banker.prototype.SaveOrNot = function (){

    let R1 = this.tmpAvailable[0].R1;
    let R2 = this.tmpAvailable[0].R2;
    let R3 = this.tmpAvailable[0].R3;
    let R4 = this.tmpAvailable[0].R4;

    var	free = {'R1':R1,'R2': R2,'R3':R3,'R4':R4};
    console.log(free);
    console.log(this.tmpAvailable);
    console.log(this.tmpAllocation);
    console.log(this.tmpNeed);

    var finish = [false,false,false,false,false];
    this.safe = []

    for(var i = 0; i < 5; ++i)
    {
        if(finish[i] == false)
        {
            if(this.tmpNeed[i].R1 <= free.R1  && this.tmpNeed[i].R2 <= free.R2 && this.tmpNeed[i].R3 <= free.R3 && this.tmpNeed[i].R4 <= free.R4)
            {
                free.R1 += this.tmpAllocation[i].R1;
                free.R2 += this.tmpAllocation[i].R2;
                free.R3 += this.tmpAllocation[i].R3;
                free.R4 += this.tmpAllocation[i].R4;
                this.FreeAndAllocation.splice(i, 0, {'R1':free.R1,'R2':free.R2,'R3':free.R3,'R4':free.R4});
                finish[i] = true;
                this.safe.push(i);
                i = -1;
            }
        }
    }

    for(var i = 0; i <= 4; ++i) {
        if (finish[i] == false) {
            return false;
        }
    }

    return true;
}

//*
/////////////////////////////////Available/////////////////////////////////
//
Banker.prototype.insertCallback = function(event) {
    var insertedValue;

    insertedValue = this.normalizeNumber(this.insertField.value, this.insertField.length);
    if (insertedValue != "")
    {
        this.insertField.value = "";
        this.implementAction(this.AvaliableinsertElement.bind(this),insertedValue);
    }
}

Banker.prototype.AvaliableinsertElement = function(insertedValue){

    this.cmd("SetText", 0, " ");
    this.commands = new Array();
    if(insertedValue.length != 7)
        alert("Invalid input, pls input four numbers")
    else {
        var t = insertedValue.split(/[ ]+/);
        var index = 117;
        for (var i = 0; i < 4; ++i) {
            this.cmd("SetText", this.barLabels[index + i], t[i]);
            this.theAvailableIndex.push(this.barLabels[index + i]);
        }
        this.Available.push({
            'R1': parseInt(t[0]),
            'R2': parseInt(t[1]),
            'R3': parseInt(t[2]),
            'R4': parseInt(t[3])
        });
    }
    this.insertField.disabled = true;
    this.insertButton.disabled = true;

    return this.commands;
}


//*
/////////////////////////////////Claim/////////////////////////////////
//

Banker.prototype.ClaiminsertCallback = function(event)
{
    var insertedValue;
    insertedValue = this.normalizeNumber(this.ClaiminsertField.value, this.ClaiminsertField.length);
    if (insertedValue != "")
    {
        this.ClaiminsertField.value = "";
        this.implementAction(this.ClaiminsertElement.bind(this),insertedValue);
    }
}

Banker.prototype.ClaiminsertElement = function(insertedValue){

    this.commands = new Array();
    if(insertedValue.length != 7)
        alert("Invalid input, pls input four numbers")
    else {
        if(this.claimNum >= 5)
            alert("FULL ");
        else {
            this.cmd("SetText", 0, "你还需要输入" + (4 - this.claimNum) + "个进程的最大资源。");
            var t = insertedValue.split(/[ ]+/);
            for (var i = 0; i < 4; ++i) {
                this.cmd("SetText", this.barLabels[this.SetClaimTextIndex], t[i]);
                this.SetClaimTextIndex++;
            }
            this.SetClaimTextIndex += 14;
            this.Max.push({
                'R1': parseInt(t[0]),
                'R2': parseInt(t[1]),
                'R3': parseInt(t[2]),
                'R4': parseInt(t[3])
            });
            this.claimNum++;
            if(this.claimNum == 5){
                this.ClaiminsertField.disabled = true;
                this.ClaiminsertButton.disabled = true;
            }
        }
    }

    return this.commands;
}


//*
/////////////////////////////////Allocated/////////////////////////////////
//
Banker.prototype.AllocatedinsertCallback = function(event)
{
    var insertedValue;

    insertedValue = this.normalizeNumber(this.AllocatedinsertField.value, this.AllocatedinsertField.length);
    if (insertedValue != "")
    {
        this.AllocatedinsertField.value = "";
        this.implementAction(this.AllocatedinsertElement.bind(this),insertedValue);
    }
}

Banker.prototype.AllocatedinsertElement = function(insertedValue){

    this.commands = new Array();
    if(insertedValue.length != 7)
        alert("Invalid input, pls input four numbers")
    else {
        if(this.AllocatedNum >= 5)
            alert("FULL ");
        else {
            this.cmd("SetText", 0, "你还需要输入" + (4 - this.AllocatedNum) + "个进程的已分配资源。");
            var t = insertedValue.split(/[ ]+/);
            for(var i = 0; i < t.length; ++i) {
                if (t[0] > this.Max[this.AllocatedNum].R1 || t[1] > this.Max[this.AllocatedNum].R2 || t[2] > this.Max[this.AllocatedNum].R3 || t[3] > this.Max[this.AllocatedNum].R4) {
                    alert("Wrong input！Pls input the right number");
                    return this.commands;
                }
            }
            for (var i = 0; i < 4; ++i) {
                this.cmd("SetText", this.barLabels[this.SetAllocatedTextIndex], t[i]);
                this.SetAllocatedTextIndex++;
            }
            this.Need.push({
                'R1': parseInt(this.Max[this.AllocatedNum].R1) - parseInt(t[0]),
                'R2': parseInt(this.Max[this.AllocatedNum].R2) - parseInt(t[1]),
                'R3': parseInt(this.Max[this.AllocatedNum].R3) - parseInt(t[2]),
                'R4': parseInt(this.Max[this.AllocatedNum].R4) - parseInt(t[3])
            });

            /*need*/
            this.cmd("SetText", this.barLabels[this.SetAllocatedTextIndex], this.Need[this.AllocatedNum].R1);
            this.theNeedIndex[this.AllocatedNum][0] = this.barLabels[this.SetAllocatedTextIndex];
            this.SetAllocatedTextIndex++;
            this.cmd("SetText", this.barLabels[this.SetAllocatedTextIndex], this.Need[this.AllocatedNum].R2);
            this.theNeedIndex[this.AllocatedNum][1] = this.barLabels[this.SetAllocatedTextIndex];
            this.SetAllocatedTextIndex++;
            this.cmd("SetText", this.barLabels[this.SetAllocatedTextIndex], this.Need[this.AllocatedNum].R3);
            this.theNeedIndex[this.AllocatedNum][2] = this.barLabels[this.SetAllocatedTextIndex];
            this.SetAllocatedTextIndex++;
            this.cmd("SetText", this.barLabels[this.SetAllocatedTextIndex], this.Need[this.AllocatedNum].R4);
            this.theNeedIndex[this.AllocatedNum][3] = this.barLabels[this.SetAllocatedTextIndex];
            this.SetAllocatedTextIndex++;

            this.theFreeAndAllocationIndex[this.AllocatedNum][0] = this.barLabels[this.SetAllocatedTextIndex];
            this.theFreeAndAllocationIndex[this.AllocatedNum][1] = this.barLabels[this.SetAllocatedTextIndex+1];
            this.theFreeAndAllocationIndex[this.AllocatedNum][2] = this.barLabels[this.SetAllocatedTextIndex+2];
            this.theFreeAndAllocationIndex[this.AllocatedNum][3] = this.barLabels[this.SetAllocatedTextIndex+3];

            this.SetAllocatedTextIndex += 10;
            this.Allocation.push({
                'R1': parseInt(t[0]),
                'R2': parseInt(t[1]),
                'R3': parseInt(t[2]),
                'R4': parseInt(t[3])
            });

            this.UseForAllocation.push({
                'R1': parseInt(t[0]),
                'R2': parseInt(t[1]),
                'R3': parseInt(t[2]),
                'R4': parseInt(t[3])
            });

            this.AllocatedNum++;

            if(this.AllocatedNum == 5){
                this.AllocatedinsertField.disabled = true;
                this.AllocatedinsertButton.disabled = true;
            }
        }
    }

    return this.commands;
}


//*
/////////////////////////Request/////////////////////////////////
//
Banker.prototype.RequestinsertCallback = function (event) {
    var insertedValue = this.RequestinsertField.value;

    if (insertedValue != "")
    {
        this.insertField.value = "";
        this.implementAction(this.Requestinsert.bind(this),insertedValue);
    }
}
Banker.prototype.Requestinsert = function(insertedValue){

    this.commands = new Array();

    if(insertedValue.length != 10)
        alert("Invalid input, pls input four numbers")
    else{
        var t = insertedValue.split(/[ ]+/);
        this.cmd("SetText", this.barLabels[122],"P" + t[0][1]);
        this.theRequestProcessID = t[0][1];
        for(var i = 0; i < 4; ++i){
            this.cmd("SetText", this.barLabels[128 + i],t[i + 1]);
            this.request[t[0][1]][i] = parseInt(t[i + 1]);
        }
        this.RequestinsertField.disabled = true;
        this.RequestinsertButton.disabled = true;
    }

    return this.commands;
}

//回调函数
Banker.prototype.returnCallback = function (option) {
    window.location.href = "index.html";
}
Banker.prototype.resetCallback = function (option) {
    this.animationManager.resetAll();
    this.Available = [];
    this.Max = [];
    this.Allocation = [];
    this.UseForAllocation = [];
    this.Need = [];
    this.safe = [];
    this.FreeAndAllocation = [];
    this.request = new Array(5);

    this.ProcessIdIndex = [];
    this.theStausIndex = new Array();
    this.theFreeAndAllocationIndex = new Array();
    this.theNeedIndex = new Array();
    this.theAvailableIndex = new Array();

    this.claimNum = 0;
    this.AllocatedNum = 0;
    this.theRequestProcessID = 0;
    this.nextIndex = 1;
    this.SetClaimTextIndex = 23;
    this.SetAllocatedTextIndex = 27;
    this.setArraySize();
    this.commands = [];
    //create random visual objects
    this.createVisualObjects();
}

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
Banker.prototype.randomizeArray = function () {
    this.commands = new Array()

    for(var i = 0; i < 6; ++i){
        this.request[i] = new Array();
        this.theNeedIndex[i] = new Array();
        this.theFreeAndAllocationIndex[i] = new Array();
    }

    var value1 = "\u8fdb\u7a0b\u005c\u8d44\u6e90";
    value1 = reconvert(value1);
    var labelCount = 0;
    this.cmd("SetText",this.barLabels[labelCount++],value1);
    this.cmd("SetText",this.barLabels[labelCount++],"Max");
    this.cmd("SetText",this.barLabels[labelCount++],"Allocation");
    this.cmd("SetText",this.barLabels[labelCount++],"Need");
    this.cmd("SetText",this.barLabels[labelCount++],"Free + Allocation");
    this.cmd("SetText",this.barLabels[labelCount++],"Finish");

    for(var i = 0; i < 16; ++i){
        this.cmd("SetText", this.barLabels[labelCount++], "R" + (i + 1));
    }

    /*P1-P5*/
    for(var i = 0; i < this.array_size; ++i){
        for(var j = 0; j < 17; ++j) {
            if(j == 0) {
                this.ProcessIdIndex.push(this.barLabels[labelCount] - 1);
                this.cmd("SetText", this.barLabels[labelCount++], "P" + (i + 1));
            }
            else {
                this.cmd("SetText", this.barLabels[labelCount++], 0);
            }
        }

        this.cmd("SetText", this.barLabels[labelCount++], "");
        this.theStausIndex.push(this.barLabels[labelCount - 1]);
        //this.cmd("SetHeight", this.barObjects[i], this.arrayData[i] * SCALE_FACTOR);
    }
    this.cmd("SetText",this.barLabels[labelCount++],"Avaliable");
    for(var i = 0; i < 4; ++i){
        this.cmd("SetText",this.barLabels[labelCount++],"R" + (i + 1));
    }
    labelCount += 4;
    this.cmd("SetText",this.barLabels[labelCount],value1);

    this.ProcessIdIndex.push(this.barLabels[labelCount+1] - 1);

    var value6 = "Request";
    labelCount += 2;
    this.cmd("SetText",this.barLabels[labelCount++],value6);

    for(var i = 0; i < 4; ++i){
        this.cmd("SetText",this.barLabels[labelCount++],"R" + (i + 1));
    }
    console.log(this.ProcessIdIndex);
    this.animationManager.StartNewAnimation(this.commands);
    // console.log(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

//set the size of the array
Banker.prototype.setArraySize = function () {
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

