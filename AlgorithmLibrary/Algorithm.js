/**
 * Created by AK4TRL on 2017/6/13.
 * 算法基类，让其他算法对基类进行继承
 *
 */
//addControlToAlgorithm
function addControlToAlgorithmBar(type, name) {
    var element = document.createElement("input");
    element.setAttribute("type", type);
    element.setAttribute("value", name);
    element.style.background = "#474747";
    element.style.fontWeight = "bold";
    element.className += "ctl"
    //console.log(element);
    var tableEntry = document.createElement("td");
    tableEntry.style.padding = "0px";
    tableEntry.style.width = "18%";
    tableEntry.appendChild(element);
    document.getElementById("AlgorithmSpecificControls").appendChild(tableEntry);
    return element;
}
function addBankerInput(type, name, num) {
    var tdBar = document.createElement("td");

    //insert allocation
    var AllocationElement = document.createElement("input");
    AllocationElement.setAttribute("id", name);
    AllocationElement.setAttribute("type", type);
    AllocationElement.setAttribute("placeholder", name);

    tdBar.setAttribute("display", "inline-block");
    tdBar.setAttribute("float", "left");

    tdBar.appendChild(AllocationElement);

    //
    if(num == 0) {
        var controlBar = document.getElementById("generalAnimationControlSection");
        var newTable = document.createElement("table");
        newTable.setAttribute("id", "datainput");
        newTable.appendChild(tdBar);
        controlBar.insertBefore(newTable,controlBar.childNodes[0]);
    }
    else {
        var controlBar = document.getElementById("datainput");
        controlBar.appendChild(tdBar);
    }

    return AllocationElement;
}

function addBankerButton(type, name) {
    var tdBar = document.getElementById(name);
    var buttonBar = document.createElement("input");
    buttonBar.setAttribute("type", "Button");

    if(tdBar == null){
        var tdCreate = document.createElement("td");
        tdCreate.setAttribute("display", "inline-block");
        tdCreate.setAttribute("float", "left");
        tdCreate.appendChild(buttonBar);
        buttonBar.setAttribute("value", name);

        var controlBar = document.getElementById("datainput");
        controlBar.appendChild(tdCreate);
    }
    else {
        var task = "\u8f93\u5165";
        task = reconvert(task);
        buttonBar.setAttribute("value", task + name);
        tdBar.parentNode.appendChild(buttonBar);
    }

    return buttonBar;
}

//addLabelToAlgorithmBar
function addLabelToAlgorithmBar(labelName) {
    var element = document.createTextNode(labelName);
    var tableEntry = document.createElement("div");
    tableEntry.appendChild(element);
    if(document.getElementById("AlgorithmIllustration").getElementsByTagName("div").length >= 2)
        document.getElementById("AlgorithmIllustration").innerHTML = "";
    if(document.getElementById("AlgorithmIllustration").getElementsByTagName("div").length >= 1){
        var newHr = document.createElement("hr");
        newHr.style = "width:90%;height:1px;border:none;border-top:1px solid #A3A3A3;";
        document.getElementById("AlgorithmIllustration").appendChild(newHr);
    }
    document.getElementById("AlgorithmIllustration").appendChild(tableEntry);
    return element;
}

var Algorithm = function(){}
//初始化，am运动物体类的基类实例
Algorithm.prototype.init = function (am, w, h) {
    this.animationManager = am;
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.actionHistory = [];
    this.recordAnimation = true;
    this.commands = [];
}
//cmd生成函数
Algorithm.prototype.cmd = function() {
    var command = arguments[0];
    for(var i = 1; i < arguments.length; i++) {
        command = command + "<;>" + String(arguments[i]);
    }
    this.commands.push(command);
}

//animation开始
Algorithm.prototype.implementAction = function(funct, val) {
    var nxt = [funct, val];
    this.actionHistory.push(nxt);
    var retVal = funct(val);
    this.animationManager.StartNewAnimation(retVal);
}

///
Algorithm.prototype.clearHistory = function()
{
    this.actionHistory = [];
}
Algorithm.prototype.isAllDigits = function(str) {
    for (var i = str.length - 1; i >= 0; i--) {
        if (str.charAt(i) < "0" || str.charAt(i) > "9") {
            return false;

        }
    }
    return true;
}

Algorithm.prototype.normalizeNumber = function(input, maxLen) {
    if (!this.isAllDigits(input) || input == "") {
        return input;
    } else {
        return input.substr( - maxLen, maxLen);
    }
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

function Queue() {
    var maxqueue = 10;
    var head = 0;
    var rear = 0;
    var queueSize = 0;
    var entry = [];
    //向队列中添加数据
    this.full = function () {
        return (((rear + 1) % (maxqueue + 1)) == head)
            && (queueSize == maxqueue);
    }
    this.pushin = function(data) {
        if (!this.full()) {
            entry[rear] = data;
            rear = (rear + 1) % (maxqueue + 1);
            ++queueSize;
        }
    }
    this.size = function () {
        return queueSize;
    }

    //从队列中取出数据
    this.popout = function() {
        if (!this.empty()) {
            head = (head + 1) % (maxqueue + 1);
            --queueSize;
        }
    }

    this.topfront = function () {
        if (!this.empty())
            return entry[head];
    }
    this.empty = function () {
        //
        return ((rear + 1) % (maxqueue + 1) == head) && (queueSize == 0);
    }
    //返回队列的大小
    this.size = function() {
        return queueSize;
    }
}