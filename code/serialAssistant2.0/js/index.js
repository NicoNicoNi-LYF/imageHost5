//串口部分
$(function() {

    // refreshBtn
    var root = $('#root'); //root为index2.html中串口模块的id
    var serialEl = $('[name=serial]', root);
    var bitrateEl = $('[name=bitrate]', root);
    var parityBitEl = $('[name=parityBit]', root);
    var stopBitsEl = $('[name=stopBits]', root);
    var sendHexEl = $('[name=sendHex]', root);
    var refreshBtn = $('.refreshBtn', root);
    var connectBtn = $('.connectBtn', root);
    var sendBtn = $('.sendBtn', root);
    var cancelBtn = $('.cancelBtn', root);
    var disconnectBtn = $('.disconnectBtn', root);
    var messageEl = $('.message', root);
    var logEl = $('.log', root);

    var openedSerials = {};
    var openedSerialIds = {};
    refreshBtn.click(function() {
        refreshSerialList();
    });

//---------------------------------------------------------------------- added
// hex转json字符串,16进制ASCII
    var hextoString = function (hex) {
        var arr = hex.split("");
        var out = "";
        for (var i = 0; i < arr.length / 2; i++) {
            var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1];
            var charValue = String.fromCharCode(tmp);
            out += charValue
        }
        return out
    };

// json字符串转hex
    var stringtoHex = function (str) {
        var val = "";
        for (var i = 0; i < str.length; i++) {
            if (val == "")
                val = str.charCodeAt(i).toString(16);
            else
                val += str.charCodeAt(i).toString(16);
        }
        val += "0a";
        return val
    };
//---------------------------------------------------------------------- added

    //串口监听器
    Serial.addListener(function(info) {
        console.log(Serial.buffer2Array(info.data));
        // writeLog(openedSerialIds[info.connectionId], '<span style="color:green;">接收</span>',Serial.buffer2HexStr(info.data) );

//---------------------------------------------------------------------- added
//         对方发送"abc" ，会接收到"61 62 63"；而hextoString("61 62 63")会有错误，需要转为 hextoString("610 620 630");
//         tmp.replaceAll(' ','0 ')) 将所有空格前添加一个0
        let tmp=Serial.buffer2HexStr(info.data);
        // tmp=tmp+' '; // 给最后添加空格
        tmp=hextoString(tmp.replaceAll(' ','0 ')); //hex转成了字符串，但是最后一个字符后多了个空格
        tmp=tmp.replaceAll(' ',''); //去掉最后面的空格
        // tmp=tmp.replaceAll(' ',''); //可以看到了 接收到"A"的hex为"41"
        writeLog(openedSerialIds[info.connectionId], '<span style="color:green;">接收</span>',tmp);

        ///////////////////////////////////////// - added
        // $('#sendMessage').val(tmp);$('#sendButton').click();
        if(tmp.search("A")!=-1){$('#sendMessage').val("当前电机状态:正转");$('#sendButton').click();}
        else if(tmp.search("B")!=-1){$('#sendMessage').val("当前电机状态:反转");$('#sendButton').click();}
        else if(tmp.search("C")!=-1){$('#sendMessage').val("当前电机状态:停止");$('#sendButton').click();}
    });

    function writeLog(com, type, log) {
        var message = logEl.html();
        if (message) {
            message += '<br />';
        }
        message += dateFormat(new Date(), 'hh:mm:ss') + ' ';
        message += com;
        message += ': [' + type + '] ';
        message += log.replace(/ /g, '&nbsp;');
        logEl.html(message);
        logEl.scrollTop(logEl[0].scrollHeight);
    }


    connectBtn.click(function() {
        var serial = serialEl.val();
        Serial.connect(serial, {
            bitrate : parseInt(bitrateEl.val()),
            parityBit : parityBitEl.val(),
            stopBits : stopBitsEl.val(),

            receiveTimeout: 3000, // 等待send操作完成的最长时间，以毫秒为单位;加上后接收消息就不会换行了---------------------------------------------------------------------- added
            sendTimeout: 3000 // 等待send操作完成的最长时间，以毫秒为单位 ---------------------------------------------------------------------- added
        }).done(function(info) {
            openedSerials[serial] = info;
            openedSerialIds[info.connectionId] = serial;
            successMessage('打开串口成功!');
        }).fail(function() {
            errorMessage('打开串口失败! 请检查指定串口是否存在或已被打开! ');
        });
    });

    cancelBtn.click(function() {
        logEl.html('');
    });

    disconnectBtn.click(function() {
        var serial = serialEl.val();
        if (!openedSerials[serial]) {
            waringMessage('串口尚未打开!');
            return;
        }
        var connectionId = openedSerials[serial].connectionId;
        Serial.disconnect(connectionId, {
            bitrate : parseInt(bitrateEl.val()),
            parityBit : parityBitEl.val(),
            stopBits : stopBitsEl.val()
        }).done(function() {
            delete openedSerialIds[connectionId];
            delete openedSerials[serial];
            successMessage('关闭串口成功!');
        }).fail(function() {
            errorMessage('关闭串口失败! ');
        });
    });

    //客户端点击发送
    sendBtn.click(function() {
        var hexStr = sendHexEl.val();
        var serial = serialEl.val();
        if (!openedSerials[serial]) {
            errorMessage('串口尚未打开!');
            return;
        }
        writeLog(serial, '<span style="color:red;">发送</span>', hexStr + ' 发送中... ');

        // Serial.sendHexStr(openedSerials[serial].connectionId, hexStr.replace(/ /g, '')).done(function() {
//---------------------------------------------------------------------- added  将发送的信息转为hexstr，这样在接收方收到就会是str
//     若不加   .replaceAll("0a","") ，发送的A的hex为"410a" 会换行，相当于发送了两条消息，则会接收到两条状态回复
//        加上后，发送的A的hex为"41" 不会换行
        Serial.sendHexStr(openedSerials[serial].connectionId, stringtoHex(hexStr).replaceAll("0a","")).done(function() {
            successMessage('发送数据成功!');
            writeLog(serial, '<span style="color:red;">发送</span>', hexStr + ' 成功! ');
            console.log(arguments);
        }).fail(function() {
            writeLog(serial, '<span style="color:red;">发送</span>', hexStr + ' 失败! ');
            errorMessage('发送数据失败!');
            errorMessage(arguments);
        });
    });


//---------------------------------------------------------------------- added
// 客户端接收到ws消息时触发串口函数群中到该事件，判断ws消息是否是控制键值对，若是，则通过串口给单片机发送控制指令
    $("#lastMessage").change( function() {
        // 这里可以写些验证代码
        // var hexStr = document.getElementById('lastMessage').value;
        var hexStr =$('#lastMessage').text(); // 获取lastMessage消息
        hexStr=hexStr.replaceAll(" ","");
        var flag; // 根据hexStr键值对 判断应该发送哪种控制字符flag
        if (hexStr.search("motor:forward")!=-1){flag="A";}
        else if (hexStr.search("motor:reverse")!=-1){flag="B";}
        else if (hexStr.search("motor:stop")!=-1){flag="C";}
        else if (hexStr.search("motor:status")!=-1){flag="S";}
        else {flag="q";}
        if(flag!="q"){
        var serial = serialEl.val();
        if (!openedSerials[serial]) {
            errorMessage('串口尚未打开!');
            return;
        }
        writeLog(serial, '<span style="color:red;">发送</span>', hexStr + ' 发送中... ');
        Serial.sendHexStr(openedSerials[serial].connectionId, stringtoHex(flag).replace("0a","")).done(function() {
            successMessage('发送数据成功!');
            writeLog(serial, '<span style="color:red;">发送</span>', hexStr + ' 成功! ');
            console.log(arguments);
        }).fail(function() {
            writeLog(serial, '<span style="color:red;">发送</span>', hexStr + ' 失败! ');
            errorMessage('发送数据失败!');
            errorMessage(arguments);
        });
        }
    });

    refreshSerialList();

    function refreshSerialList() {
        Serial.getDevices().done(function(portsArray) {
            serialEl.empty();
            for (var i = 0; i < portsArray.length; i++) {
                serialEl.append('<option value="' + portsArray[i].path + '">' + portsArray[i].path + '</option>');
            }
        });
    }

    function successMessage(msg) {
        messageEl.html('<span style="color:green;">' + msg + '</span>');
    }

    function errorMessage(msg) {
        messageEl.html('<span style="color:red;">' + msg + '</span>');
    }

    function waringMessage(msg) {
        messageEl.html('<span style="color:orange;">' + msg + '</span>');
    }

    function dateFormat(date, fmt) {
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                 fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }

        return fmt;
    }

});


// websocket部分

new function() {
    var ws = null;
    var connected = false;

    var serverUrl;
    var connectionStatus;
    var sendMessage; // 发送消息的框

    var connectButton;
    var disconnectButton;
    var sendButton;// 发送按钮
    var sendButton2;// 发送按钮

    var requestArea ; // 客户端中需要隐藏的部分
    // 上面均为声明，不声明不能在函数中通过选择器选中

    //断开连接后的操作
    var open = function() {
        //获取url框中的内容
        var url = serverUrl.val();

        //实现WebSocket类为ws，并定义方法
        ws = new WebSocket(url);
        ws.onopen = onOpen;
        ws.onclose = onClose;
        ws.onmessage = onMessage;
        ws.onerror = onError;
        //连接服务器后的一些DOM设定
        connectionStatus.text('OPENING ...'); // 状态显示更改
        serverUrl.attr('disabled', 'disabled'); // 设定URL不可更改
        connectButton.hide(); // 隐藏连接按钮
        disconnectButton.show(); // 显示断开连接按钮
    };

    //断开连接后的操作
    var close = function() {
        if (ws) {
            console.log('CLOSING ...');
            ws.close();
        }
        connected = false;
        connectionStatus.text('CLOSED');

        serverUrl.removeAttr('disabled');
        connectButton.show();
        disconnectButton.hide();
        sendMessage.attr('disabled', 'disabled');
        sendButton.attr('disabled', 'disabled');
    };

    //聊天清屏
    var clearLog = function() {
        $('#messages').html('');
    };

    var onOpen = function() {
        console.log('OPENED: ' + serverUrl.val());
        connected = true;
        connectionStatus.text('OPENED');
        sendMessage.removeAttr('disabled');
        sendButton.removeAttr('disabled');
    };

    var onClose = function() {
        console.log('CLOSED: ' + serverUrl.val());
        ws = null;
    };
    //接收到消息
    var onMessage = function(event) {
        var data = event.data;
        addMessage(data);
        $('#lastMessage').text(data); // 设置lastmessage----------------------------------------------------------------------added
        $("#lastMessage").change();
    };

    var onError = function(event) {
        alert(event.data);
    };

    var addMessage = function(data, type) {
        var msg = $('<pre>').text(data);
        if (type === 'SENT') {
            msg.addClass('sent');
        }
        var messages = $('#messages');
        messages.append(msg);

        var msgBox = messages.get(0);
        while (msgBox.childNodes.length > 1000) {
            msgBox.removeChild(msgBox.firstChild);
        }
        msgBox.scrollTop = msgBox.scrollHeight;

    };


    WebSocketClient = {
        //初始化
        init: function() {
            //定义id的映射
            serverUrl = $('#serverUrl');
            connectionStatus = $('#connectionStatus');
            sendMessage = $('#sendMessage');

            connectButton = $('#connectButton');
            disconnectButton = $('#disconnectButton');
            sendButton = $('#sendButton');

// --------------------------隐藏部分DOM--------------------------------------------added
//             sendButton.hide();
            requestArea =$('#requestArea'); // 不能直接定义，需要在最开始声明 var requestArea ;
            requestArea.hide();
// ----------------------------------------------------------------------added
            connectButton.click(function(e) {
                close();
                open();
            });

            disconnectButton.click(function(e) {
                close();
            });

            sendButton.click(function(e) {
                var msg = $('#sendMessage').val();
                addMessage(msg, 'SENT');
                ws.send(msg);
            });

            sendButton2.click(function(e) { // ----------------------------------------------------------------------added
                var msg = $('#sendMessage').val();
                addMessage(msg, 'SENT');
                ws.send(msg);
            });


            $('#clearMessage').click(function(e) {
                clearLog();
            });

            // 定义按键事件
            var isCtrl;
            sendMessage.keyup(function (e) {
                if(e.which == 17) isCtrl=false;
            }).keydown(function (e) {
                if(e.which == 17) isCtrl=true;
                if(e.which == 13 && isCtrl == true) {
                    sendButton.click();
                    return false;
                }
            });
        }
    };
};

$(function() {
    WebSocketClient.init();
});