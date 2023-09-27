

var websocket = null;
//判断当前浏览器是否支持WebSocket
if ('WebSocket' in window) {
    // websocket = new WebSocket("ws://localhost:8080/websocket");
    // websocket = new WebSocket("ws://localhost:8080/motor2/websocket");
    websocket = new WebSocket("ws://39.106.195.123:8080/motor2/websocket"); //部署到服务器后的ip
    //协议 ip 端口号 contextPath websocket
    //---------------------------------------------------------------------- added  ws服务器地址

    // websocket = new WebSocket("ws://172.25.225.153:8080/websocket");
    // websocket = new WebSocket("ws://localhost:8080/motor2/ws.jsp");
} else {
    alert('当前浏览器 Not support websocket')
}

//连接发生错误的回调方法
websocket.onerror = function () {
    setMessageInnerHTML("WebSocket连接发生错误");
};

//连接成功建立的回调方法
websocket.onopen = function () {
    setMessageInnerHTML("WebSocket连接成功");
};

//接收到消息的回调方法
websocket.onmessage = function (event) {
    setMessageInnerHTML(event.data);

//---------------------------------------------------------------------- added
    setMessageInnerHTML_2(event.data);  //added
};

//连接关闭的回调方法
websocket.onclose = function () {
    setMessageInnerHTML("WebSocket连接关闭");
};

//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
window.onbeforeunload = function () {
    closeWebSocket();
};


//将消息显示在网页上
function setMessageInnerHTML(innerHTML) {
    // document.getElementById('message').innerHTML += innerHTML + '<br/>';

//---------------------------------------------------------------------- added
    var d = document.createElement('p');
    d.innerHTML = innerHTML;
    document.getElementById('message').appendChild(d);
}

//---------------------------------------------------------------------- added
//将last消息显示在网页上 并调用文本框改变事件来串口通信
function setMessageInnerHTML_2(innerHTML) { //added
    // document.getElementById('lastMessage').value = innerHTML + '<br/>';
    // $('#lastMessage').innerHTML = '<p id="lastMessage">'+innerHTML+'</p>';

    // document.getElementById('lastMessage').innerHTML = innerHTML;
    document.getElementById('lastMessage2').value =innerHTML;

    // 当符合特定格式时，调用串口
    if(innerHTML.toLowerCase().search("motor")!=-1){
    $("#lastMessage2").change(); //调用文本框改变事件
    // sendBtn.click();
    }
}

//关闭WebSocket连接
function closeWebSocket() {
    websocket.close();
}

//发送消息
function send() {
    // var message = document.getElementById('text').value;
    message = $("#text").val();
    websocket.send(message);
}


