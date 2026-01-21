$(function () {
	$('[data-toggle="tooltip"]').tooltip();

	const $body = $("body");

	if (localStorage.getItem("theme") === "light") {
		$body.addClass("light-theme");
	}

	$("#theme-toggle").on("click", function () {
		$body.toggleClass("light-theme");

		if ($body.hasClass("light-theme")) {
			localStorage.setItem("theme", "light");
		} else {
			localStorage.setItem("theme", "dark");
		}
	});
});

(function () {
	const sidebar = document.querySelector(".slim-sidebar");
	if (!sidebar) return;

	const isBranch = (li) =>
		li && li.classList && li.classList.contains("with-sub");

	const getDirectSubmenu = (li) => {
		const link = li.querySelector(".sidebar-nav-link, .nav-sub-link");
		if (!link) return null;

		const next = link.nextElementSibling;
		if (next && next.matches("ul.sidebar-nav-sub")) return next;

		return li.querySelector("ul.sidebar-nav-sub");
	};

	const closeSiblings = (li) => {
		const parentUl = li.parentElement;
		if (!parentUl) return;

		Array.from(parentUl.children).forEach((sib) => {
			if (
				sib !== li &&
				sib.classList &&
				sib.classList.contains("with-sub")
			) {
				sib.classList.remove("open");
				// закрыть всё вложенное внутри соседа
				sib.querySelectorAll(".with-sub.open").forEach((x) =>
					x.classList.remove("open")
				);
			}
		});
	};

	const normalizePath = (href) => {
		const path = href.replace(/https?:\/\/[^/]+/i, "");
		return (path.replace(/\/+$/, "") || "/") + "/";
	};

	sidebar.addEventListener("click", (e) => {
		const link = e.target.closest(".sidebar-nav-link, .nav-sub-link");
		if (!link) return;

		const li =
			link.closest("li.nav-sub-item.with-sub") ||
			link.closest("li.sidebar-nav-item.with-sub");

		if (!isBranch(li)) return;

		const sub = getDirectSubmenu(li);
		if (!sub) return;

		const href = link.getAttribute("href") || "";
		const isFakeLink = href === "" || href.startsWith("javascript:");

		if (isFakeLink) e.preventDefault();

		const willOpen = !li.classList.contains("open");

		closeSiblings(li);

		li.classList.toggle("open", willOpen);
	});

	const current = (location.pathname.replace(/\/+$/, "") || "/") + "/";

	const links = sidebar.querySelectorAll(
		"a.sidebar-nav-link, a.nav-sub-link"
	);

	let active = null;
	links.forEach((a) => {
		const href = a.getAttribute("href");
		if (!href || href.startsWith("javascript:")) return;

		if (normalizePath(href) === current) active = a;
	});

	if (active) {
		active.classList.add("active");
		let p = active.parentElement;
		while (p && p !== sidebar) {
			if (p.classList && p.classList.contains("with-sub")) {
				p.classList.add("open");
			}
			p = p.parentElement;
		}
	}
})();
