<%@ page import="static com.fly.servlet.MyServer.statusStr" %>
<%@ page language="java" pageEncoding="UTF-8"
         contentType="text/html;charset=UTF-8" %>
<%
    //jsp脚本片段
    String path = request.getContextPath();  //获取 Application context:
    // /motor
    String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path + "/";//获取url
    //  http://localhost:8080/motor2/
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
    <%--    规定页面中所有相对链接的基准 URL。--%>
    <base href="<%=basePath%>">

    <title>远程电机控制系统</title>
    <%--   禁止浏览器从本地计算机的缓存中访问页面内容。
            无法脱机浏览，再次进入曾经访问过的页面时，浏览器必须从服务端下载最新的内容，达到刷新的效果。
    --%>
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">

    <meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
    <%--    用于搜索引擎优化（SEO）--%>
    <meta http-equiv="description" content="单片机">
    <meta http-equiv="description" content="串口">
    <meta http-equiv="description" content="远程电机">

<%--
用"/static/js/jquery-3.2.1.js"、"../static/js/jquery-3.2.1.js"都不行
--%>
    <script src="static/js/jquery-3.2.1.js"></script>
    <script src="serialAssistant/js/websocket.js"></script>

</head>

<%--CSS--%>
<style type="text/css">
    #controlText {
        width: 100%;
        color: blueviolet;
        text-indent: 46px;
    }

</style>
<body>


<div class="header" style="background: white">
    <%--    header使用纯白背景，不然两张图片背景不透明，看着不合适--%>
    <%--jSP标签;对于拼接共享页面，一般使用标签，灵活性高
    jsp:include：拼接页面，本质还是三个--%>
    <jsp:include page="/common/header.jsp"/>
</div>

<h2>========= Web串口远程控制51单片机 =========</h2>
说明：使用聊天窗口发送特定 "键值对" 来控制串口通信



<input type="text"  value="电机正转:{motor: forward}   电机反转:{motor: reverse}   电机停止:{motor: stop}   获取状态:{motor: status}"
       id="controlText" readonly/>

<br>

<%------------------------------websocket--------------------------------------------%>
<div class="websocket" style="background: white">
<style type="text/css">
    #message
    {
        /*background-color:#00FFFF;*/
        width:100%;
        height:500px;
        overflow: scroll;
    }
    #lastMessage2{
        width: 100%;
        border_color: "white";
    }
</style>
<span >WebSocket</span>
<br/><input id="text" type="text"/>
<button onclick="send()">发送消息</button>
<hr/>
<button onclick="closeWebSocket()">关闭WebSocket连接</button>
<hr/>

<p id="lastMessage"></p>
<span>最近一条消息：</span><input type="text" value="" id="lastMessage2" readonly />

<hr/>
<div id="message"> </div>
</div>

<br>
<%--------------------------------------------------------------------------%>
<form action="${pageContext.request.contextPath}/logout" method="get">
    注销：<input type="submit" value="确定">
</form>

<%--已经规定了页面中所有相对链接的基准，不需要再获取contextPath--%>
<%--<p><a href="logout">注销</a></p> --%>

<br><br><br><br>
<%--页脚--%>
<div class="footer" style="background: white">
    <jsp:include page="/common/footer.jsp"/>
</div>
    <
</body>

<%--电机控制按钮--%>
<script src="static/js/motor-control.js"></script>

<%--js特效--%>
<%--<script src="static/js/cet4.js"></script>--%>

<!-- 雪花特效 -->
<script type="text/javascript" src="static/js/snow.js"></script>


</html>


