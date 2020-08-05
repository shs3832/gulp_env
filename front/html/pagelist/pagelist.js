(function ($, window) {
	/*
	///// setting
  */
	var projectName = "SE임파워", // 프로젝트 이름
		categories = ["front", "admin"], // 작업 범위
		starDate = "2020.03", // 시작 일정
		endDate = "2020.04", // 종료 일정
		responsive = true, // 반응형 여부
		ieVersion = "11"; // 익스플로러 크로스 브라우징 범위

	/**
	 //// Build list
	*/
	var pagelist = function () {
		var selector,
			module,
			template,
			num = 1;

		selector = {
			win: $(window),
			doc: $(document),
			tit: $("title"),
			body: $("body"),
			main: ".PagelistMain",
			header: ".PagelistHeader",
			bar: ".PagelistBar",
			nav: ".PagelistLangSelector ul",
			items: ".PagelistLangSelector li a",
			tbl: ".PagelistTable",
			fot: ".PagelistFooter",
		};
		module = {
			init: function () {
				module.build();
				module.ajaxCall($(".PagelistLangSelector li:first-child a"));
			},
			build: function () {
				selector.tit.text(projectName + " HTML Pagelist");
				selector.body.prepend(template.header);
				$(selector.header).prepend(template.title(projectName));
				$(selector.bar).append(template.overview);
				$(selector.bar).append(template.progress);
				$(selector.main).prepend(template.nav.selector);
				for (var i = 0; i < categories.length; i++) {
					$(selector.nav).append(template.nav.items(categories[i]));
					if (i == 0) {
						$(selector.items).parent().addClass("active");
					}
					console.log(categories);
				}
				selector.body.append(template.fot);
			},
			ajaxCall: function (lang) {
				$.ajax({
					type: "GET",
					dataType: "json",
					async: false,
					url: module.get.jsonUrl(lang),
					success: function (data) {
						module.act.tblReset();
						module.listup(data);
						module.calcProcess(data);
					},
					error: function () {
						module.act.tblReset();
						$(selector.tbl).append(
							$("<tbody></tbody>").append(
								$("<tr></tr>").append(
									$('<td colspan="9"></td>')
										.addClass("wrong")
										.append($("<p></p>").text("리스트 파일이 없습니다."))
								)
							)
						);
					},
					complete: function () {
						module.act.langSelect(lang);
					},
				});
			},
			get: {
				jsonUrl: function (el) {
					return el.text() + ".json";
				},
			},
			act: {
				langSelect: function (el) {
					$(selector.items).parent().removeClass("active");
					$(el).parent().addClass("active");
				},
				tblReset: function () {
					$(selector.tbl).find("tbody").remove();
					num = 1;
				},
			},
			listup: function (data) {
				for (var i = 0; i < data.length; i++) {
					$(selector.tbl).append($("<tbody></tbody>"));
					for (var j = 0; j < data[i].items.length; j++) {
						$(selector.tbl)
							.find("tbody")
							.eq(i)
							.append(
								$("<tr></tr>")
									.attr("data-url", data[i].items[j].url)
									.append($("<td></td>").text(num++))
									.append(template.tbl.dep1(j, data[i].categories))
									.append($("<td></td>").text(data[i].items[j].depth2))
									.append($("<td></td>").text(data[i].items[j].depth3))
									.append(
										$("<td></td>").append(
											$("<a></a>")
												.attr("href", data[i].items[j].url)
												.attr("target", "_blank")
												.text(data[i].items[j].url)
										)
									)
									.append(
										$('<td class="done"></td>').append(
											$("<span></span>").attr(
												"class",
												data[i].items[j].complete ? "is-done" : "is-not"
											)
										)
									)
									.append($("<td></td>").html(data[i].items[j].memo))
							);
					}
				}
			},
			calcProcess: function (data) {
				var done = 0;
				var yet = 0;
				for (var i = 0; i < data.length; i++) {
					for (var idx = 0; idx < data[i].items.length; idx++) {
						if (data[i].items[idx].complete) {
							done++;
						} else {
							yet++;
						}
					}
				}

				var total_page = done + yet;
				var process_percent = (done / total_page) * 100;

				$(".PagelistProgress").text(
					"전체:" +
						total_page +
						" / 완료:" +
						done +
						" / 진행율:" +
						process_percent +
						"%"
				);
			},
		};
		template = {
			header: function () {
				return $("<header></header>")
					.addClass("PagelistHeader")
					.append($("<div></div>").addClass("PagelistBar"));
			},
			title: function (title) {
				return $("<h1></h1>")
					.addClass("PagelistTitle")
					.text(title + " HTML Pagelist");
			},
			overview: function () {
				return $("<div></div>")
					.addClass("PagelistOverview")
					.text(
						"기간: " +
							starDate +
							" ~ " +
							endDate +
							" / " +
							template.isResponsive() +
							"ie" +
							ieVersion +
							"+"
					);
			},
			isResponsive: function () {
				if (responsive) {
					return "반응형 / ";
				} else {
					return "";
				}
			},
			progress: function () {
				return $("<div></div>")
					.addClass("PagelistProgress")
					.text("전체: 완료: 진행율:");
			},
			nav: {
				selector: function () {
					return $("<nav></nav>")
						.addClass("PagelistLangSelector")
						.append($("<ul></ul>"));
				},
				items: function (lang) {
					return $("<li></li>").append(
						$("<a></a>")
							.attr("href", "javascript:")
							.text(lang)
							.on("click", function () {
								if ($(this).parent().hasClass("active")) {
									return;
								}
								module.ajaxCall($(this));
							})
					);
				},
			},
			tbl: {
				dep1: function (i, o) {
					if (i <= 0) {
						return $("<td></td>").text(o);
					} else {
						return $("<td></td>");
					}
				},
			},
			fot: function () {
				return $("<footer></footer>")
					.addClass("PagelistFooter")
					.append(
						$("<p></p>")
							.addClass("PagelistCopyright")
							.text(
								"COPYRIGHT ©2019 OMInteractive Co.,Ltd. All Rights Reserved"
							)
					);
			},
		};
		module.init();
	};

	var onReady = function () {
		pagelist();
	};

	$(document).ready(onReady);
})(jQuery, window);
