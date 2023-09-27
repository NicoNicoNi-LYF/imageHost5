// <script type="text/javascript">

// 正转
function goON_1() {
	var parameterId = document.getElementById("parameterId");
	parameterId.value = "on_1";
	document.forms[0].submit();
}
// 反转
function goON_2() {
	var parameterId = document.getElementById("parameterId");
	parameterId.value = "on_2";
	document.forms[0].submit();
}

// 关闭
function goOFF() {
	var parameterId = document.getElementById("parameterId");
	parameterId.value = "off";
	document.forms[0].submit();
}

// 获取点击运行状态
function getStatus() {
	var parameterId = document.getElementById("parameterId");
	parameterId.value = "status";
	document.forms[0].submit();
}
// </script>
