$(function() {
    // refreshBtn
    var root = $('#root');
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
        tmp=hextoString(tmp.replaceAll(' ','0 '));
        // tmp=tmp.replaceAll(' ',''); //可以看到了 接收到"A"的hex为"41"
        writeLog(openedSerialIds[info.connectionId], '<span style="color:green;">接收</span>',tmp);
        //
        if(tmp=="A"){websocket.send("当前电机状态:正转");}
        else if(tmp=="B"){setMessageInnerHTML_2("当前电机状态:反转")}
        else if(tmp=="C"){setMessageInnerHTML_2("当前电机状态:停止")}
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
    // $("input[type='text']").change( function() {
    $("#lastMessage2").change( function() {
        // 这里可以写些验证代码
        var hexStr = document.getElementById('lastMessage2').value;
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
        Serial.sendHexStr(openedSerials[serial].connectionId, stringtoHex(flag).replace("a","")).done(function() {
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
/*    $("#lastMessage2").change( function() {
        // 这里可以写些验证代码
        var hexStr = document.getElementById('lastMessage2').value;
        var serial = serialEl.val();
        if (!openedSerials[serial]) {
            errorMessage('串口尚未打开!');
            return;
        }
        writeLog(serial, '<span style="color:red;">发送</span>', hexStr + ' 发送中... ');
        Serial.sendHexStr(openedSerials[serial].connectionId, hexStr.replace(/ /g, '')).done(function() {
            successMessage('发送数据成功!');
            writeLog(serial, '<span style="color:red;">发送</span>', hexStr + ' 成功! ');
            console.log(arguments);
        }).fail(function() {
            writeLog(serial, '<span style="color:red;">发送</span>', hexStr + ' 失败! ');
            errorMessage('发送数据失败!');
            errorMessage(arguments);
        });

    });*/
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



