chrome.app.runtime.onLaunched.addListener(function () {
	// 在新窗口打开指定页面
	chrome.app.window.create('index2.html', {

	}, function(appWin) {
		console.log(appWin);
	});

});

