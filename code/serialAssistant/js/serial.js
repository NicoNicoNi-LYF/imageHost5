var Serial = (function() {
    /**
     * 获取串口列表
     */
    function getDevices() {
        var deferred = $.Deferred();
        // 获取串口列表
        chrome.serial.getDevices(function(portsArray) {
            console.log('getDevices', portsArray);
            deferred.resolve(portsArray);
        });
        return deferred.promise();
    }

    /**
     * 连接指定串口
     * @param path 串口名称, 如: COM1, COM2 等
     * @param options 串口配置项, 如波特率等
     */
    function connect(path, options) {
    // var options = {
    //     persistent: false, // 应用关闭时连接是否保持打开状态
    //     name: 'test', // 与连接相关联的字符串
    //     bufferSize: 4096, // 用于接收数据的缓冲区大小
    //     bitrate: 9600, // 打开连接时请求的比特率
    //     dataBits: 'eight', // 默认为eight, "seven", or "eight"
    //     parityBit: 'no', // 奇偶校验, 默认为no, "no", "odd", or "even"
    //     stopBits: 'one', // 停止位, 默认为one, "one", or "two"
    //     ctsFlowControl: false, // 是否启用RTS/CTS硬件流控制
    //     receiveTimeout: 3000, // 等待新数据的最长时间，以毫秒为单位
    //     sendTimeout: 3000 // 等待send操作完成的最长时间，以毫秒为单位
    // };

        var deferred = $.Deferred();
        chrome.serial.connect(path, options, function(connectionInfo) {
            if (chrome.runtime.lastError) {
                deferred.reject(chrome.runtime.lastError.message);
            } else {
                console.log('connect', connectionInfo);
                if (connectionInfo) {
                    deferred.resolve(connectionInfo);
                } else {
                    deferred.reject(connectionInfo);
                }
            }
            deferred.notify(connectionInfo);

        });
        return deferred.promise();
    }

    // 断开一个连接
    function disconnect(connectionId) {
        var deferred = $.Deferred();
        chrome.serial.disconnect(connectionId, function(result){
            console.log('disconnect', result);
            if (result) {
                deferred.resolve(result);
            } else {
                deferred.reject(result);
            }
            deferred.notify(result);
        });
        return deferred.promise();
    }

    // 发送数据
    function send(connectionId, arrayBuffer) {
        var deferred = $.Deferred();
        // chrome.serial.flush(currentConnectionId, function () { // 这里的 flush 是否必要? 
            var len = arrayBuffer.byteLength;
            // 发送数据
            chrome.serial.send(connectionId, arrayBuffer, function(sendInfo){
                console.log('send', sendInfo);
                if (!sendInfo.error) {
                    if (len === sendInfo.bytesSent) {
                        deferred.resolve(sendInfo.bytesSent);
                    }
                    deferred.reject(1, sendInfo.bytesSent);
                } else {
                    deferred.reject(2, sendInfo.error);
                }
                deferred.notify(sendInfo);
            });
        // });

        return deferred.promise();
    }

    function sendHexStr(connectionId, hexStr) {
        // 发送指令
        return send(connectionId, hexStr2Buffer(hexStr));
    }



    // 监听的所有数组
    var listeners = [];
    // 添加一个监听方法
    function addListener(fn) {
        listeners.push(fn);
    }

    // 移除一个监听方法
    function removeListenter(fn) {
        var i, len = listeners.length;
        for (i = 0; i < len; i++) {
            if (fn === listeners[i]) {
                listeners.splice(i, 1);
                break;
            }
        }
    }


    // 循环执行监听方法
    function onReceive(info) {
        for (var i = 0; i < listeners.length; i++) {
            if (typeof listeners[i] === 'function') {
                listeners[i](info);
            }
        }
    }

    // 启动串口监听
    function startListener() {
        // 该方法会监听所有由 Chrome App 打开的串口 ( 是否可以跨 App 监听? 如 App1 启动的开启的连接, App2 是否可以读取这个连接内容? 待测试)
        chrome.serial.onReceive.addListener(function(info) {
            console.log(info);
            onReceive(info);
            // chrome.serial.flush(currentConnectionId, function() {}); // 之前加了这一个, 不确定 flush 方法是否需要
        });
    }
    startListener(); // 启动监听

    function hexStr2Buffer(hexStr) {
        var i, len, array = [];
        for (i = 0, len = hexStr.length; i < len; i += 2) {
            array.push(parseInt(hexStr.substr(i, 2), 16));
        }
        return new Uint8Array(array).buffer;
    }

    function buffer2Array(buffer) {
        return new Uint8Array(buffer);
    }

    function buffer2HexStr(buffer) {
        return array2HexStr(buffer2Array(buffer));
    }
    
    function array2HexStr(array) {
        var i = 0;
        var str = '';
        for (i=0; i<array.length; i++) {
            str += hex(array[i]) + ' ';
        }
        function hex(val) {
            var temp = val.toString(16);
            if (temp.length < 2) {
                temp = '0' + temp;
            }
            return temp;
        }
        return str;

    }




    return {
        getDevices: getDevices,
        connect : connect,
        disconnect : disconnect,
        addListener : addListener,
        removeListenter : removeListenter,
        startListener : startListener,
        sendHexStr : sendHexStr,
        send : send,
        buffer2HexStr : buffer2HexStr,
        buffer2Array : buffer2Array,
        hexStr2Buffer : hexStr2Buffer,

    };
})();