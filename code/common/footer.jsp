<%@ page import="static com.fly.util.Constant.USER_SESSION" %>
<%@ page import="static com.fly.util.Constant.ONLINE_SESSION" %>
<%@ page import="static com.fly.util.Constant.*" %>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>


<%
    //当前在线人数：
    Integer onlineCount = (Integer) request.getSession().getServletContext().getAttribute(ONLINE_SESSION);  //获取util类中的
//    int online = (int) request.getSession().getServletContext().getAttribute(onlineCount);  //获取util类中的
//    Integer onlineCount = getOnlineCount(); //调用WebSocketTest中的方法

%>
<div style="text-align:left ">
    <h3>当前在线人数为 <font style="color: darkcyan" size="5"> <%=onlineCount%> </font>人 (同一个账号，不同浏览器可累加) </h3>
</div>

<br>
