/**
 * Created by AK4TRL on 2018/1/23.
 */


var curPage;
var canvas;

var BAR_FOREGROUND_COLOR = "#000";
var BAR_BACKGROUND_COLOR ="#FFF";
var INDEX_COLOR = "#000";
var HIGHLIGHT_BAR_BACKGROUND_COLOR = "#FFAAAA";
var EDGE_HIGHLIGHT = "#FF0000";

var Page = function (am, w, h) {
    this.init(am, w, h);
}
Page.prototype = new Algorithm();
Page.prototype.constructor = Page;
Page.superclass = Algorithm.prototype;

Page.MESSAGE_X = 35;
Page.MESSAGE_Y = 728;
Page.MESSAGE_ID = 0;

function init() {
    var animManag = initCanvas();
    curPage = new Page(animManag, canvas.width, canvas.height);
}

//Banker继承算法基类与其本身构造
Page.prototype.init = function (am, w, h) {

    Page.superclass.init.call(this,am);
    this.addControls();
    this.nextIndex = 1;

    this.PageAddressIndex = 0;
    this.PageNoIndex = 0;
    this.pageListIndex = 0;
    this.resultIndex = 0;
    this.pageNumIndex = 0;
    this.PageLengthIndex = 0;
    this.LogicaladdressIndex = 0;
    this.CompareIndex = 0;
    this.addIndex = 0;
    this.OOBIndex = 0;
    this.PT = new Array();


    this.PageLength = 0;
    this.PageNo = 0;
    this.PageAddress = 0;
    this.LogicalAddress = 0;
    this.PageSize = 0;

    this.setArraySize();
    this.commands = [];
    //create random visual objects
    this.createVisualObjects();
}
//创建表格和label组件
Page.prototype.createVisualObjects = function(){

    this.barObjects = new Array(this.array_size);
    this.oldBarObjects= new Array(this.array_size);
    this.oldbarLabels= new Array(this.array_size);

    this.barLabels = new Array(this.array_size);
    this.barPositionsY = new Array(this.array_size);
    this.oldData = new Array(this.array_size);
    this.obscureObject  = new Array(this.array_size);

    var xPos = this.array_x_pos;
    var yPos = this.array_y_pos;
    var yLabelPos = this.array_label_y_pos;

    this.commands = new Array();

    this.cmd("CreateLabel",Page.MESSAGE_ID,"Pls input the data" ,Page.MESSAGE_X,Page.MESSAGE_Y, 0);

    var labelCount = 0;
    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + 700, yPos, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "",  xPos + 700, yPos);
    this.PageNoIndex = this.nextIndex;
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + 700 + this.array_width, yPos, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "", xPos + 700 + this.array_width, yPos);
    this.PageAddressIndex = this.nextIndex;
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos, yPos, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "0", xPos, yPos);
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + this.array_width, yPos, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "", xPos + this.array_width, yPos);
    this.PageLengthIndex = this.nextIndex;
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateCircle", this.nextIndex++, "+", xPos, yPos + 100);
    this.addIndex = this.nextIndex - 1;
    this.cmd("CreateCircle", this.nextIndex++, ">", xPos + 400, yPos);
    this.CompareIndex = this.nextIndex - 1;
    this.cmd("Connect",this.nextIndex - 6, this.nextIndex - 2);
    this.cmd("Connect",this.nextIndex - 3, this.nextIndex - 1);
    this.cmd("Connect",this.nextIndex - 9, this.nextIndex - 1);

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + 400, yPos - 100, "center", "center");
    this.cmd("Connect",this.nextIndex - 2, this.nextIndex - 1);
    this.cmd("Connect",this.nextIndex - 2, this.nextIndex - 3);

    this.cmd("CreateCircle", this.nextIndex++, "", xPos, yPos + 350);
    this.cmd("CreateLabel", this.nextIndex, "0", xPos, yPos + 350);
    this.pageNumIndex = this.nextIndex;
    this.barLabels[labelCount++] = this.nextIndex++;
    this.cmd("Connect",this.nextIndex - 5, this.nextIndex - 1);

    var pageTable = "\u9875\u8868\u5f85\u5b9a";
    pageTable = reconvert(pageTable);

    this.cmd("CreateLabel", this.nextIndex++, pageTable, xPos + 350, yPos + 350);
    this.pageListIndex = this.nextIndex - 1;

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + 700, yPos + 350, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "",  xPos + 700, yPos + 350);
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + this.array_width + 700, yPos + 350, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "",  xPos + this.array_width + 700, yPos + 350);
    this.barLabels[labelCount++] = this.nextIndex++;
    this.cmd("Connect",this.barLabels[1], this.nextIndex - 1);
    this.resultIndex = this.nextIndex - 3;


    var Logicaladdress = "\u903b\u8f91\u5730\u5740";
    Logicaladdress = reconvert(Logicaladdress);
    var PageNo = "\u9875\u53f7";
    PageNo = reconvert(PageNo);
    var Pageaddress = "\u9875\u5185\u5730\u5740";
    Pageaddress = reconvert(Pageaddress);
    var Pageregister = "\u9875\u8868\u5bc4\u5b58\u5668";
    Pageregister = reconvert(Pageregister);
    var Pagetablestart = "\u9875\u8868\u8d77\u59cb\u9ed8\u8ba4\u4e3a\u0030";
    Pagetablestart = reconvert(Pagetablestart);
    var Pagetablelen = "\u9875\u8868\u957f\u5ea6";
    Pagetablelen = reconvert(Pagetablelen);
    var Physicaladdress = "\u7269\u7406\u5730\u5740";
    Physicaladdress = reconvert(Physicaladdress);
    var Transboundaryinterruption = "\u8d8a\u754c\u4e2d\u65ad";
    Transboundaryinterruption = reconvert(Transboundaryinterruption);
    var Unit = "\u5355\u4f4d";
    Unit = reconvert(Unit);

    this.cmd("CreateLabel", this.nextIndex++, Logicaladdress + ":", xPos + 700 + this.array_width / 2, yPos - 100);
    this.cmd("CreateLabel", this.nextIndex++, PageNo, xPos + 700, yPos - 50);
    this.cmd("CreateLabel", this.nextIndex++, Pageaddress, xPos + this.array_width + 700, yPos - 50);
    this.cmd("CreateLabel", this.nextIndex++, Pageregister, xPos + this.array_width / 2, yPos - 100);
    this.cmd("CreateLabel", this.nextIndex++, Pagetablestart, xPos - 20, yPos - 50);
    this.cmd("CreateLabel", this.nextIndex++, Pagetablelen, xPos + this.array_width - 15, yPos - 50);
    this.cmd("CreateLabel", this.nextIndex++, Physicaladdress, xPos + 700 + this.array_width / 2, yPos + 400);
    this.cmd("CreateLabel", this.nextIndex++, Transboundaryinterruption, xPos + 400, yPos - 100);
    this.OOBIndex = this.nextIndex - 1;
    this.cmd("CreateLabel", this.nextIndex++, Unit + ": KB", xPos + 430, yPos + 620);

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.randomizeArray();

    for (var i = 0; i < this.array_size; i++)
    {
        this.obscureObject[i] = false;
    }
    this.lastCreatedIndex = this.nextIndex;
}

//初始化控件
Page.prototype.addControls = function () {

    //返回主页
    this.returnButton = addControlToAlgorithmBar("Button", "返回");
    this.returnButton.onclick = this.returnCallback.bind(this);

    //reset
    this.resetButton = addControlToAlgorithmBar("Button", "重置");
    this.resetButton.onclick = this.resetCallback.bind(this);

    var task1 = "\u9875\u8868\u957f\u5ea6";
    task1 = reconvert(task1);

    var task2 = "\u903b\u8f91\u5730\u5740";
    task2 = reconvert(task2);

    var task3 = "\u9875\u9762\u5927\u5c0f";
    task3 = reconvert(task3);

    this.controls = [];
    /*页表长度*/
    this.insertField = addBankerInput("Text", task1,0);
    this.controls.push(this.insertField);

    this.insertButton = addBankerButton("Button", task1);
    this.insertButton.onclick = this.insertCallback.bind(this);
    this.controls.push(this.insertButton);

    /*逻辑地址*/
    this.LogicaladdressInsertField = addBankerInput("Text", task2,1);
    this.controls.push(this.LogicaladdressInsertField);

    this.LogicaladdressInsertButton = addBankerButton("Button", task2);
    this.LogicaladdressInsertButton.onclick = this.LogicaladdressInsertCallback.bind(this);
    this.controls.push(this.LogicaladdressInsertButton);

    /*页面大小*/
    this.PagesizeInsertField = addBankerInput("Text", task3,1);
    this.controls.push(this.PagesizeInsertField);

    this.PagesizeInsertButton = addBankerButton("Button", task3);
    this.PagesizeInsertButton.onclick = this.PagesizeInsertCallback.bind(this);
    this.controls.push(this.PagesizeInsertButton);

    //start
    this.PagingAddressTranslationStartButton = addBankerButton("Button", "Paging Address Translation Start");
    this.PagingAddressTranslationStartButton.onclick = this.PagingAddressTranslationStartCallback.bind(this);
    this.controls.push(this.PagingAddressTranslationStartButton);
}

//回调函数
Page.prototype.returnCallback = function (option) {
    window.location.href = "index.html";
}
Page.prototype.resetCallback = function (option) {
    this.animationManager.resetAll();

    this.setArraySize();
    this.commands = [];
    //create random visual objects
    this.createVisualObjects();
}

//*
/////////////////////////////////页表长度设置,this.Pagelength/////////////////////////////////
//
Page.prototype.insertCallback = function (option) {
    //
    var insertedValue;

    insertedValue = this.normalizeNumber(this.insertField.value, this.insertField.length);
    if (insertedValue != "") {
        this.implementAction(this.insertElement.bind(this), insertedValue);
    }
}
Page.prototype.insertElement = function (insertedValue) {
    //
    this.commands = new Array();

    if(parseInt(insertedValue) > 6){
        alert("too large, it's better to be smaller than 6");
    }
    else {
        this.PageLength = parseInt(insertedValue);
        this.cmd("SetText", this.PageLengthIndex, this.PageLength);
        for(var i = 0; i < parseInt(insertedValue); ++i){
            this.PT[i] = Math.floor(1 + Math.random()*512);
        }
        this.cmd("SetText",this.pageListIndex,"");
        this.cmd("CreateLabel", this.nextIndex++, "page", 500, 360, 1);
        this.cmd("CreateLabel", this.nextIndex++, "block", 570, 360, 1);
        this.pageListIndex = this.nextIndex;
        for(var i = 0; i < parseInt(insertedValue); ++i) {
            this.cmd("CreateGrid", this.nextIndex++, i, 70, 40, 500, 400 + (i * 40));
            this.cmd("CreateGrid", this.nextIndex++, this.PT[i], 70, 40, 570, 400 + (i * 40));
        }
        this.cmd("Step");
        this.cmd("Connect",this.nextIndex - parseInt(insertedValue) * 2 + 1, this.resultIndex);// from to
        this.cmd("Connect", this.pageNumIndex, this.nextIndex - parseInt(insertedValue) * 2);
    }

    this.insertField.disabled = true;
    this.insertButton.disabled = true;

    console.log(this.commands);

    return this.commands;
}
//*
/////////////////////////////////逻辑地址设置,this.LogicalAddress/////////////////////////////////
//
Page.prototype.LogicaladdressInsertCallback = function (option) {
    var insertedValue;

    insertedValue = this.normalizeNumber(this.LogicaladdressInsertField.value, this.LogicaladdressInsertField.length);
    if (insertedValue != "") {
        this.implementAction(this.LogicaladdressInsert.bind(this), insertedValue);
    }
}
Page.prototype.LogicaladdressInsert = function (insertedValue) {
    //
    this.commands = new Array();

    this.LogicaladdressIndex = this.nextIndex++;
    this.cmd("CreateLabel", this.LogicaladdressIndex, parseInt(insertedValue), this.array_x_pos + 868, this.array_y_pos - 100)

    this.LogicalAddress = parseInt(insertedValue);

    this.LogicaladdressInsertField.disabled = true;
    this.LogicaladdressInsertButton.disabled = true;

    return this.commands;
}
//*
/////////////////////////////////页面大小设置,this.PageSize/////////////////////////////////
//
Page.prototype.PagesizeInsertCallback = function (option) {
    var insertedValue;

    insertedValue = this.normalizeNumber(this.PagesizeInsertField.value, this.PagesizeInsertField.length);
    if (insertedValue != "") {
        this.implementAction(this.PagesizeInsert.bind(this),insertedValue);
    }
}
Page.prototype.PagesizeInsert = function (insertedValue) {
    //
    this.commands = new Array();

    this.PageSize = parseInt(insertedValue) * 1024;
    this.PageNo = Math.floor(this.LogicalAddress / this.PageSize);
    this.PageAddress = this.LogicalAddress % this.PageSize;

    this.cmd("SetText",this.PageNoIndex, this.PageNo);
    this.cmd("SetText",this.PageAddressIndex, this.PageAddress);

    this.cmd("SetText",this.barLabels[this.barLabels.length - 1], this.PageAddress);

    this.PagesizeInsertField.disabled = true;
    this.PagesizeInsertButton.disabled = true;

    return this.commands;
}
//*
/////////////////////////////////开始/////////////////////////////////
//
Page.prototype.PagingAddressTranslationStartCallback = function () {
    this.implementAction(this.PagingAddressTranslationStart.bind(this), 0);
}
Page.prototype.PagingAddressTranslationStart = function () {
    this.commands = new Array();

    if(this.PageNo == null || this.PageNo == undefined || this.PageLength == null || this.PageLength == undefined || this.LogicalAddress == null || this.LogicalAddress == undefined){
        alert("Pls input the data first.")
    }
    else {
        this.cmd("SetText", 0, "Is the PageNo bigger than the PageLength?");
        this.cmd("Step");
        this.cmd("SetEdgeHighLight", this.PageNoIndex, this.CompareIndex, EDGE_HIGHLIGHT);
        this.cmd("SetEdgeHighLight", this.PageLengthIndex, this.CompareIndex, EDGE_HIGHLIGHT);
        this.cmd("Step");
        this.cmd("Disconnect", this.PageNoIndex, this.CompareIndex);
        this.cmd("Disconnect", this.PageLengthIndex, this.CompareIndex);
        this.cmd("Connect", this.PageNoIndex, this.CompareIndex);
        this.cmd("Connect", this.PageLengthIndex, this.CompareIndex);
        if (this.PageLength < this.PageNo) {
            this.cmd("SetText", 0, "The PageNo. is bigger than the PageLength, Out of bounds!");
            this.cmd("Step");
            this.cmd("SetEdgeHighLight", this.CompareIndex, this.OOBIndex, EDGE_HIGHLIGHT);
            this.cmd("Step");
            this.cmd("SetText", 0, "Over");
        }
        else {
            //
            this.cmd("SetText", 0, "The PageNo. is smaller than the PageLength, pass");
            this.cmd("SetEdgeHighLight",this.CompareIndex,this.addIndex,EDGE_HIGHLIGHT);
            this.cmd("Step");
            this.cmd("Disconnect",this.CompareIndex,this.addIndex);
            this.cmd("Connect",this.CompareIndex,this.addIndex);
            this.cmd("Step");
            this.cmd("SetEdgeHighLight",this.addIndex,this.pageNumIndex,EDGE_HIGHLIGHT);
            this.cmd("Step");
            this.cmd("Disconnect",this.addIndex,this.pageNumIndex);
            this.cmd("Connect",this.addIndex,this.pageNumIndex);
            this.cmd("Step");
            this.cmd("SetBackgroundColor", this.pageNumIndex - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText",this.pageNumIndex, this.PageNo);
            this.cmd("Step");
            this.cmd("SetText", 0, "Find the PageNo that suit to this.");
            this.cmd("Step");
            for(var i = 0; i < this.PageLength; ++i){

                if(this.PageNo != i){
                    this.cmd("SetText",0, "It's not the same.")
                    this.cmd("Step");
                    this.cmd("SetText",0, "Next")
                    this.cmd("Disconnect",this.pageNumIndex,this.pageListIndex);
                    this.cmd("Disconnect",this.pageListIndex + 1,this.resultIndex);
                    this.cmd("Step");
                    this.pageListIndex += 2;
                }
                else{
                    this.cmd("SetText",0, "Find it!")
                    this.cmd("Step");
                    this.cmd("SetEdgeHighLight",this.pageNumIndex,this.pageListIndex,EDGE_HIGHLIGHT);
                    this.cmd("Step");
                    break;
                }
                this.cmd("Connect",this.pageNumIndex,this.pageListIndex);
                this.cmd("Connect",this.pageListIndex + 1,this.resultIndex);
                this.cmd("Step");
            }
            this.cmd("SetEdgeHighLight",this.pageListIndex + 1,this.resultIndex,EDGE_HIGHLIGHT);
            this.cmd("Step");
            this.cmd("SetText",this.resultIndex,this.PT[this.PageNo]);
            this.cmd("Step");
            this.cmd("Disconnect",this.pageListIndex + 1,this.resultIndex);
            this.cmd("Connect",this.pageListIndex + 1,this.resultIndex);
            this.cmd("Disconnect",this.pageNumIndex,this.pageListIndex);
            this.cmd("Connect",this.pageNumIndex,this.pageListIndex);
            this.cmd("SetBackgroundColor", this.pageNumIndex - 1, "#fff");
            this.cmd("SetText",0, "Cals the last result.");
            this.cmd("Step");
            this.cmd("CreateLabel",this.nextIndex++,this.PT[this.PageNo] + " * 1024 * " + (this.PageSize / 1024)+ " + " + this.PageAddress + " = ", this.array_x_pos + 600, this.array_y_pos + 500);
            this.cmd("Step");
            this.cmd("CreateLabel",this.nextIndex++,(this.PT[this.PageNo] * this.PageSize + this.PageAddress), this.array_x_pos + 800, this.array_y_pos + 500);
        }
    }

    return this.commands;
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
Page.prototype.randomizeArray = function () {
    this.commands = new Array()
    this.animationManager.StartNewAnimation(this.commands);
    // console.log(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

//set the size of the array
Page.prototype.setArraySize = function () {
    //
    this.array_width = 160;
    this.array_height = 40;
    this.array_bar_width = 140;
    this.array_x_pos = 188;
    this.array_y_pos = 168;
    this.array_label_y_pos = 128;
    this.showLabels = true;
}

