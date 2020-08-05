console.log(1);
() => {
	alert(1);
	alert(2);
};

$(document).ready(function () {
	var v1 = '테스트1';
	console.log(`backticktest:${v1}`);
	const value = 102;
	$('h1').css({
		background: 'black',
	});
	console.log('test2');
});

async function test() {}
