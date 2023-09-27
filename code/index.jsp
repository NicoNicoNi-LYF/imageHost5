<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>登录远程电机控制系统</title>
    <!--MD5工具类-->
    <script src="https://cdn.bootcss.com/blueimp-md5/2.10.0/js/md5.min.js"></script>
</head>

<body>
<%--header--%>
<jsp:include page="/common/header.jsp"/>


<div style="text-align:center ">
    <h1>登录</h1>
    西华大学毕业设计
    <br>
    学号：3320170193236
    <%--${pageContext.request.contextPath}代表当前的项目--%>
    <%--这里表单表示的意思: 以post方式提交表单,提交到我们的Login请求--%>
    <form action="${pageContext.request.contextPath}/LoginServlet" method="post" onsubmit="return pwd2md5()">
        <span>用户名：</span> <input type="text" name="username"> <br>
        <span>密码：</span> <input type="password" id="input-password" > <br>
        <input type="hidden" id="md5-password" name="password">
        <!--绑定事件 onclick 被点击-->
        <br>
        <input type="submit" value="登录">
    </form>
    <!--
    表单绑定提交事件
    onsubmit= 绑定一个提交检测的函数， true， false
    将这个结果返回给表单，使用 onsubmit 接收！
    onsubmit="return pwd2md5()"
    md5("123456");   e10adc3949ba59abbe56e057f20f883e
    -->


</div>



</body>

<script>
    function pwd2md5() {
        // alert(1); //可视化判断某段程序是否执行
        var uname = document.getElementById('username');
        var pwd = document.getElementById('input-password');
        var md5pwd = document.getElementById('md5-password');
        // pwd.value = md5(pwd.value);
        md5pwd.value = md5(pwd.value);
        // 可以校验判断表单内容，true就是通过提交，false，阻止提交
        return true;
    }
</script>

<%--js特效--%>
<script src="static/js/line.js"></script>

<script src="static/js/activate-power-mode.js"></script>

<script>
    POWERMODE.colorful = true; // 控制开启/开启礼花特效
    POWERMODE.shake = false; // 控制开启/关闭屏幕震动特效
    document.body.addEventListener('input', POWERMODE);
</script>

</html>

<%--
tree -N /Users/andrew/IdeaProjects/javawebmavenpure/serial_port_drive_motor/src/main
/Users/andrew/IdeaProjects/javawebmavenpure/serial_port_drive_motor/src/main
main
├── java
│   └── com
│       └── fly
│           ├── filter
│           │   ├── CharacterEncodingFilter.java
│           │   ├── LoginServlet.java
│           │   ├── LogoutServlet.java
│           │   └── SysFilter.java
│           ├── listener
│           │   └── OnlineCountListener.java
│           ├── pojo
│           │   ├── HashUtil.java
│           │   └── MD5Util.java
│           ├── servlet
│           │   ├── MyServer.java
│           │   └── Tools.java
│           ├── useless
│           │   ├── SerialTool.java
│           │   ├── SerialUtil.java
│           │   └── SerialVo.java
│           └── util
│               └── Constant.java
├── resource
└── webapp
    ├── WEB-INF
    │   └── web.xml
    ├── common
    │   ├── footer.jsp
    │   └── header.jsp
    ├── index.jsp
    ├── resource
    │   ├── i-xhu-01.png
    │   └── i-xhu-02.png
    ├── static
    │   ├── css
    │   ├── html
    │   └── js
    │       ├── activate-power-mode.js
    │       ├── cet4.js
    │       ├── line.js
    │       ├── motor-control.js
    │       └── snow.js
    └── sys
        └── success.jsp
--%>