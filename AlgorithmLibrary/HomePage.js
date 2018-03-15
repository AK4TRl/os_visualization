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
    this.task1Button = addControlToAlgorithmBar("Button", "scheduling algorithm");
    this.task1Button.onclick = this.task1Callback.bind(this);

    //银行家算法
    this.task2Button = addControlToAlgorithmBar("Button", "Banker Algorithm");
    this.task2Button.onclick = this.task2Callback.bind(this);

    //内存分配算法
    this.task3Button = addControlToAlgorithmBar("Button","Memory allocation algorithm");
    this.task3Button.onclick = this.task3Callback.bind(this);

    //页式地址转换
    this.task4Button = addControlToAlgorithmBar("Button","Paging Address Translation");
    this.task4Button.onclick = this.task4Callback.bind(this);

    //段式地址转换
    this.task5Button = addControlToAlgorithmBar("Button","Segment Address Translation");
    this.task5Button.onclick = this.task5Callback.bind(this);

    //页面置换算法
    this.task6Button = addControlToAlgorithmBar("Button","Page replacement algorithm");
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