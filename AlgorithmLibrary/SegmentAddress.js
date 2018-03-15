/**
 * Created by AK4TRL on 2018/2/18.
 */


var curSegment;
var canvas;

var BAR_FOREGROUND_COLOR = "#000";
var BAR_BACKGROUND_COLOR ="#FFF";
var INDEX_COLOR = "#000";
var HIGHLIGHT_BAR_BACKGROUND_COLOR = "#FFAAAA";
var EDGE_HIGHLIGHT = "#FF0000";

var Segment = function (am, w, h) {
    this.init(am, w, h);
}
Segment.prototype = new Algorithm();
Segment.prototype.constructor = Segment;
Segment.superclass = Algorithm.prototype;

Segment.MESSAGE_X = 35;
Segment.MESSAGE_Y = 728;
Segment.MESSAGE_ID = 0;

function init() {
    var animManag = initCanvas();
    curSegment = new Segment(animManag, canvas.width, canvas.height);
}

//Banker继承算法基类与其本身构造
Segment.prototype.init = function (am, w, h) {

    Segment.superclass.init.call(this,am);
    this.addControls();
    this.nextIndex = 1;

    this.SegmentAddressIndex = 0;
    this.SegmentNoIndex = 0;
    this.SegmentListIndex = 0;
    this.resultIndex = 0;
    this.SegmentNumIndex = 0;
    this.SegmentLengthIndex = 0;
    this.LogicaladdressIndex = 0;
    this.CompareIndex = 0;
    this.addIndex = 0;
    this.addIndex2 = 0;
    this.OOBIndex = 0;
    this.SL = new Array();
    this.ST = new Array();


    this.SegmentLength = 0;
    this.SegmentNo = 0;
    this.SegmentAddress = 0;
    this.Displacement = 0;

    this.setArraySize();
    this.commands = [];
    //create random visual objects
    this.createVisualObjects();
}
//创建表格和label组件
Segment.prototype.createVisualObjects = function(){

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

    this.cmd("CreateLabel",Segment.MESSAGE_ID,"Pls input the data" ,Segment.MESSAGE_X,Segment.MESSAGE_Y, 0);

    var labelCount = 0;
    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + 700, yPos, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "",  xPos + 700, yPos);
    this.SegmentNoIndex = this.nextIndex;
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + 700 + this.array_width, yPos, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "", xPos + 700 + this.array_width, yPos);
    this.SegmentAddressIndex = this.nextIndex;
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos, yPos, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "0", xPos, yPos);
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + this.array_width, yPos, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "", xPos + this.array_width, yPos);
    this.SegmentLengthIndex = this.nextIndex;
    this.barLabels[labelCount++] = this.nextIndex++;

    this.cmd("CreateCircle", this.nextIndex++, "+", xPos, yPos + 80);
    this.addIndex = this.nextIndex - 1;
    this.cmd("CreateCircle", this.nextIndex++, ">", xPos + 400, yPos);
    this.CompareIndex = this.nextIndex - 1;
    this.cmd("Connect",this.nextIndex - 6, this.nextIndex - 2);
    this.cmd("Connect",this.nextIndex - 3, this.nextIndex - 1);
    this.cmd("Connect",this.nextIndex - 9, this.nextIndex - 1);

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + 400, yPos - 100, "center", "center");
    this.cmd("Connect",this.nextIndex - 2, this.nextIndex - 1);
    this.cmd("Connect",this.nextIndex - 2, this.nextIndex - 3);

    this.cmd("CreateCircle", this.nextIndex++, "", xPos, yPos + 180);
    this.cmd("CreateLabel", this.nextIndex, "0", xPos, yPos + 180);
    this.SegmentNumIndex = this.nextIndex;
    this.barLabels[labelCount++] = this.nextIndex++;
    this.cmd("Connect",this.nextIndex - 5, this.nextIndex - 1);

    var SegmentTable = "\u6bb5\u8868\u5f85\u5b9a";
    SegmentTable = reconvert(SegmentTable);

    this.cmd("CreateLabel", this.nextIndex++, SegmentTable, xPos + 350, yPos + 250);
    this.SegmentListIndex = this.nextIndex - 1;

    this.cmd("CreateCircle", this.nextIndex++, "+", xPos + this.array_width + 700 , yPos + 120);
    this.addIndex2 = this.nextIndex - 1;
    this.cmd("Connect",this.barLabels[1], this.nextIndex - 1);

    this.cmd("CreateGrid", this.nextIndex++, "", this.array_width, this.array_height, xPos + this.array_width + 700, yPos + 250, "center", "center");
    this.cmd("CreateLabel", this.nextIndex, "",  xPos + this.array_width + 700, yPos + 250);
    this.barLabels[labelCount++] = this.nextIndex++;
    this.cmd("Connect",this.addIndex2, this.nextIndex - 1);
    this.resultIndex = this.nextIndex - 1;


    var Logicaladdress = "\u903b\u8f91\u5730\u5740";
    Logicaladdress = reconvert(Logicaladdress);
    var Segmentregister = "\u6bb5\u8868\u5bc4\u5b58\u5668";
    Segmentregister = reconvert(Segmentregister);
    var Segmenttablestart = "\u6bb5\u8868\u8d77\u59cb\u9ed8\u8ba4\u4e3a\u0030";
    Segmenttablestart = reconvert(Segmenttablestart);
    var Segmenttablelen = "\u6bb5\u8868\u957f\u5ea6";
    Segmenttablelen = reconvert(Segmenttablelen);
    var Physicaladdress = "\u7269\u7406\u5730\u5740";
    Physicaladdress = reconvert(Physicaladdress);
    var Transboundaryinterruption = "\u8d8a\u754c\u4e2d\u65ad";
    Transboundaryinterruption = reconvert(Transboundaryinterruption);
    var format = "\u683c\u5f0f";
    format = reconvert(format);
    var SegmentNo = "\u6bb5\u53f7";
    SegmentNo = reconvert(SegmentNo);
    var Displacement = "\u4f4d\u79fb\u91cf";
    Displacement = reconvert(Displacement);

    this.cmd("CreateLabel", this.nextIndex++, Logicaladdress + ":", xPos + 700 + this.array_width / 2, yPos - 100);
    this.cmd("CreateLabel", this.nextIndex++, SegmentNo, xPos + 700, yPos - 50);
    this.cmd("CreateLabel", this.nextIndex++, Displacement, xPos + this.array_width + 700, yPos - 50);
    this.cmd("CreateLabel", this.nextIndex++, Segmentregister, xPos + this.array_width / 2, yPos - 100);
    this.cmd("CreateLabel", this.nextIndex++, Segmenttablestart, xPos - 20, yPos - 50);
    this.cmd("CreateLabel", this.nextIndex++, Segmenttablelen, xPos + this.array_width - 15, yPos - 50);
    this.cmd("CreateLabel", this.nextIndex++, Physicaladdress, xPos + 700 + this.array_width, yPos + 300);
    this.cmd("CreateLabel", this.nextIndex++, Transboundaryinterruption, xPos + 400, yPos - 100);
    this.OOBIndex = this.nextIndex - 1;
    this.cmd("CreateLabel", this.nextIndex++, format + ": " + SegmentNo + "," + Displacement, xPos + 180, yPos + 620);

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
Segment.prototype.addControls = function () {

    //返回主页
    this.returnButton = addControlToAlgorithmBar("Button", "Return");
    this.returnButton.onclick = this.returnCallback.bind(this);

    //reset
    this.resetButton = addControlToAlgorithmBar("Button", "Reset");
    this.resetButton.onclick = this.resetCallback.bind(this);

    var task1 = "\u6bb5\u8868\u957f\u5ea6";
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

    //start
    this.SegmentAddressTranslationStartButton = addBankerButton("Button", "Segment Address Translation Start");
    this.SegmentAddressTranslationStartButton.onclick = this.SegmentAddressTranslationStartCallback.bind(this);
    this.controls.push(this.SegmentAddressTranslationStartButton);
}

//回调函数
Segment.prototype.returnCallback = function (option) {
    window.location.href = "index.html";
}
Segment.prototype.resetCallback = function (option) {
    this.animationManager.resetAll();

    this.setArraySize();
    this.commands = [];
    //create random visual objects
    this.createVisualObjects();
}

//*
/////////////////////////////////段表长度设置,this.Segmentlength/////////////////////////////////
//
Segment.prototype.insertCallback = function (option) {
    //
    var insertedValue;

    insertedValue = this.normalizeNumber(this.insertField.value, this.insertField.length);
    if (insertedValue != "") {
        this.implementAction(this.insertElement.bind(this), insertedValue);
    }
}
Segment.prototype.insertElement = function (insertedValue) {
    //
    this.commands = new Array();

    if(parseInt(insertedValue) > 6){
        alert("too large, it's better to be smaller than 6");
    }
    else {
        this.SegmentLength = parseInt(insertedValue);
        this.cmd("SetText", this.SegmentLengthIndex, this.SegmentLength);


        this.ST = createRandomArr(parseInt(insertedValue), 1, 10);
        this.SL = createRandomArr(parseInt(insertedValue), 200,800);

        this.cmd("SetText",this.SegmentListIndex,"");
        this.cmd("CreateLabel", this.nextIndex++, "segment", 500, 260, 1);
        this.cmd("CreateLabel", this.nextIndex++, "base", 570, 260, 1);
        this.cmd("CreateLabel", this.nextIndex++, "segmentLenght", 680, 260, 1);
        this.SegmentListIndex = this.nextIndex;
        for(var i = 0; i < parseInt(insertedValue); ++i) {
            this.cmd("CreateGrid", this.nextIndex++, i, 60, 40, 500, 300 + (i * 40));
            this.cmd("CreateGrid", this.nextIndex++, this.ST[i] + "KB", 90, 40, 570, 300 + (i * 40));
            this.cmd("CreateGrid", this.nextIndex++, this.SL[i], 90, 40, 660, 300 + (i * 40));
        }
    }

    this.insertField.disabled = true;
    this.insertButton.disabled = true;

    console.log(this.commands);

    return this.commands;
}
//*
/////////////////////////////////逻辑地址设置,this.LogicalAddress/////////////////////////////////
//
Segment.prototype.LogicaladdressInsertCallback = function (option) {
    var insertedValue;

    insertedValue = this.normalizeNumber(this.LogicaladdressInsertField.value, this.LogicaladdressInsertField.length);
    if (insertedValue != "") {
        this.implementAction(this.LogicaladdressInsert.bind(this), insertedValue);
    }
}
Segment.prototype.LogicaladdressInsert = function (insertedValue) {
    //
    this.commands = new Array();

    insertedValue = insertedValue.split(",");
    this.LogicaladdressIndex = this.nextIndex++;
    this.cmd("CreateLabel", this.LogicaladdressIndex,"(" + parseInt(insertedValue[0]) + "," + parseInt(insertedValue[1]) + ")", this.array_x_pos + 868, this.array_y_pos - 100)
    this.cmd("SetText",this.SegmentNoIndex, parseInt(insertedValue[0]));
    this.cmd("SetText",this.SegmentAddressIndex, parseInt(insertedValue[1]));

    this.SegmentNo = parseInt(insertedValue[0]);
    this.Displacement = parseInt(insertedValue[1]);

    this.LogicaladdressInsertField.disabled = true;
    this.LogicaladdressInsertButton.disabled = true;

    return this.commands;
}

//*
/////////////////////////////////开始/////////////////////////////////
//
Segment.prototype.SegmentAddressTranslationStartCallback = function () {
    this.implementAction(this.SegmentAddressTranslationStart.bind(this), 0);
}
Segment.prototype.SegmentAddressTranslationStart = function () {
    this.commands = new Array();

    if(this.SegmentNo == null || this.SegmentNo == undefined || this.SegmentLength == null || this.SegmentLength == undefined){
        alert("Pls input the data first.")
    }
    else {
        this.cmd("SetText", 0, "Is the SegmentNo bigger than the SegmentLength?");
        this.cmd("Step");
        this.cmd("SetEdgeHighLight", this.SegmentNoIndex, this.CompareIndex, EDGE_HIGHLIGHT);
        this.cmd("SetEdgeHighLight", this.SegmentLengthIndex, this.CompareIndex, EDGE_HIGHLIGHT);
        this.cmd("Step");
        this.cmd("Disconnect", this.SegmentNoIndex, this.CompareIndex);
        this.cmd("Disconnect", this.SegmentLengthIndex, this.CompareIndex);
        this.cmd("Connect", this.SegmentNoIndex, this.CompareIndex);
        this.cmd("Connect", this.SegmentLengthIndex, this.CompareIndex);
        if (this.SegmentLength < this.SegmentNo) {
            this.cmd("SetText", 0, "The SegmentNo. is bigger than the SegmentLength, Out of bounds!");
            this.cmd("Step");
            this.cmd("SetEdgeHighLight", this.CompareIndex, this.OOBIndex, EDGE_HIGHLIGHT);
            this.cmd("Step");
            this.cmd("SetText", 0, "Over");
        }
        else {
            //
            this.cmd("SetText", 0, "The SegmentNo. is smaller than the SegmentLength, pass");
            this.cmd("SetEdgeHighLight",this.CompareIndex,this.addIndex,EDGE_HIGHLIGHT);
            this.cmd("Step");
            this.cmd("Disconnect",this.CompareIndex,this.addIndex);
            this.cmd("Connect",this.CompareIndex,this.addIndex);
            this.cmd("Step");
            this.cmd("SetEdgeHighLight",this.addIndex,this.SegmentNumIndex,EDGE_HIGHLIGHT);
            this.cmd("Step");
            this.cmd("Disconnect",this.addIndex,this.SegmentNumIndex);
            this.cmd("Connect",this.addIndex,this.SegmentNumIndex);
            this.cmd("Step");
            this.cmd("SetBackgroundColor", this.SegmentNumIndex - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText",this.SegmentNumIndex, this.SegmentNo);
            this.cmd("Step");
            this.cmd("SetText", 0, "Find the SegmentNo that suit to this.");
            this.cmd("Step");
            for(var i = 0; i < this.SegmentLength; ++i){
                this.cmd("Connect",this.SegmentNumIndex,this.SegmentListIndex);
                this.cmd("Connect",this.SegmentListIndex + 1,this.addIndex2);
                if(this.SegmentNo != i){
                    this.cmd("SetText",0, "It's not the same.")
                    this.cmd("Step");
                    this.cmd("SetText",0, "Next")
                    this.cmd("Disconnect",this.SegmentNumIndex,this.SegmentListIndex);
                    this.cmd("Disconnect",this.SegmentListIndex + 1,this.addIndex2);
                    this.cmd("Step");
                    this.SegmentListIndex += 3;
                }
                else{
                    this.cmd("SetText",0, "Find it!")
                    this.cmd("Step");
                    this.cmd("SetEdgeHighLight",this.SegmentNumIndex,this.SegmentListIndex,EDGE_HIGHLIGHT);
                    this.cmd("Step");
                    break;
                }
                this.cmd("Connect",this.SegmentNumIndex,this.SegmentListIndex);
                this.cmd("Connect",this.SegmentListIndex + 1,this.addIndex2);
                this.cmd("Step");
            }
            this.cmd("SetEdgeHighLight",this.SegmentListIndex + 1,this.addIndex2,EDGE_HIGHLIGHT);
            this.cmd("Step");
            //this.cmd("SetText",this.addIndex2,this.ST[this.SegmentNo]);
            this.cmd("Disconnect",this.SegmentListIndex + 1,this.addIndex2);
            this.cmd("Connect",this.SegmentListIndex + 1,this.addIndex2);
            this.cmd("Disconnect",this.SegmentNumIndex,this.SegmentListIndex);
            this.cmd("Connect",this.SegmentNumIndex,this.SegmentListIndex);
            this.cmd("SetBackgroundColor", this.SegmentNumIndex - 1, "#fff");
            this.cmd("SetText",0, "Cals the last result.");
            this.cmd("Step");
            this.cmd("SetEdgeHighLight",this.addIndex2,this.resultIndex,EDGE_HIGHLIGHT);
            this.cmd("Step");
            this.cmd("CreateLabel",this.nextIndex++,this.ST[this.SegmentNo] + " * 1024 + " + this.Displacement + " = ", this.array_x_pos + 300, this.array_y_pos + 500);
            this.cmd("Step");
            this.cmd("CreateLabel",this.nextIndex++,(this.ST[this.SegmentNo] * 1024 + this.Displacement), this.array_x_pos + 450, this.array_y_pos + 500);
            this.cmd("Step");
            this.cmd("SetBackgroundColor", this.resultIndex - 1, HIGHLIGHT_BAR_BACKGROUND_COLOR);
            this.cmd("SetText", this.resultIndex, (this.ST[this.SegmentNo] * 1024 + this.Displacement));
            this.cmd("Disconnect",this.addIndex2,this.resultIndex);
            this.cmd("Connect",this.addIndex2,this.resultIndex);
            this.cmd("Step");
            this.cmd("SetBackgroundColor", this.resultIndex - 1, "#fff");
            this.cmd("SetText",0, "Finish!");
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
//随机不重复数组
function sortNumber(a,b) {
    return a - b
}
function createRandomArr(l, st, ed){
    var r = [];
    var o = {};
    var a;
    for (var i = 0;i < l;i++){
        a = Math.floor(st + Math.random()*ed);
        o[a] ? i-- : (r.push(a),o[a] = true);
    }
    if(st == 1)
        r.sort(sortNumber);

    return r;
}
//random array info
Segment.prototype.randomizeArray = function () {
    this.commands = new Array()

    this.animationManager.StartNewAnimation(this.commands);
    // console.log(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

//set the size of the array
Segment.prototype.setArraySize = function () {
    //
    this.array_width = 160;
    this.array_height = 40;
    this.array_bar_width = 140;
    this.array_x_pos = 188;
    this.array_y_pos = 168;
    this.array_label_y_pos = 128;
    this.showLabels = true;
}

