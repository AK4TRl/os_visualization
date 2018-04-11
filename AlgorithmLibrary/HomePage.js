/**
 * Created by AK4TRL on 2017/9/8.
 */

var curProcessScheduling;
var canvas;

var HomePage = function (am, w, h) {
    this.init(am, w, h);
}

function init() {
    var animManag = initPage();
    curProcessScheduling = new HomePage(animManag, canvas.width, canvas.height);
}

HomePage.prototype = new Algorithm();
HomePage.prototype.constructor = HomePage;
HomePage.superclass = Algorithm.prototype;
HomePage.prototype.init = function (am, w, h) {
    //HomePage.superclass.init.call(this,am);
    this.addControls();
    this.nextIndex = 0;
}

function initPage() {
    canvas =  document.getElementById("canvas");
    var context=canvas.getContext('2d');
    context.font="bold 40px Arial";
    context.fillStyle="#058";
    context.fillText("WelCome To Algorithm Visualizations",canvas.width / 2 - 300,canvas.height / 2);
}
//初始化控件
HomePage.prototype.addControls = function () {

    //调度算法
    var task1 = "\u8fdb\u7a0b\u8c03\u5ea6\u7b97\u6cd5";
    task1 = reconvert(task1);
    this.task1Button = addControlToAlgorithmBar("Button", task1);
    this.task1Button.onclick = this.task1Callback.bind(this);

    //银行家算法
    var task2 = "\u94f6\u884c\u5bb6\u7b97\u6cd5";
    task2 = reconvert(task2);
    this.task2Button = addControlToAlgorithmBar("Button", task2);
    this.task2Button.onclick = this.task2Callback.bind(this);

    //内存分配算法
    var task3 = "\u5185\u5b58\u5206\u914d\u7b97\u6cd5";
    task3 = reconvert(task3);
    this.task3Button = addControlToAlgorithmBar("Button",task3);
    this.task3Button.onclick = this.task3Callback.bind(this);

    //页式地址转换
    var task4 = "\u9875\u5f0f\u5730\u5740\u8f6c\u6362";
    task4 = reconvert(task4);
    this.task4Button = addControlToAlgorithmBar("Button",task4);
    this.task4Button.onclick = this.task4Callback.bind(this);

    //段式地址转换
    var task5 = "\u6bb5\u5f0f\u5730\u5740\u8f6c\u6362";
    task5 = reconvert(task5);
    this.task5Button = addControlToAlgorithmBar("Button",task5);
    this.task5Button.onclick = this.task5Callback.bind(this);

    //页面置换算法
    var task6 = "\u9875\u9762\u7f6e\u6362\u7b97\u6cd5";
    task6 = reconvert(task6);
    this.task6Button = addControlToAlgorithmBar("Button",task6);
    this.task6Button.onclick = this.task6Callback.bind(this);
}

HomePage.prototype.task1Callback = function (option) {
    window.location.href = "SchedulingAlgorithm.html";
}
HomePage.prototype.task2Callback = function (option) {
    window.location.href = "BankerAlgorithm.html";
}
HomePage.prototype.task3Callback = function (option) {

}
HomePage.prototype.task4Callback = function (option) {
    window.location.href = "PagingAddressTranslation.html";
}
HomePage.prototype.task5Callback = function (option) {
    window.location.href = "SegmentAddressTranslation.html";
}
HomePage.prototype.task6Callback = function (option) {

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