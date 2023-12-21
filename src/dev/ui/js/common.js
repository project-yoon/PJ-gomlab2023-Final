var deviceMode;

//util - js sibs
const siblings = (el) => { return [...el.parentNode.children].filter((child) => child !== el) }
//util - js setClass
function setClass(el, currentClass) {
	let element = el

	const getFirstClass = (element) => { return element.classList[0] }
	const getSibs = siblings(el, getFirstClass(el))

	el.classList.add(currentClass)
	getSibs.forEach(sib => {
		sib.classList.remove(currentClass)
	})
}
// 이전 형제 요소들의 너비와 마진을 합산하는 함수
const sumPrevSiblings = function (element) {
    let sum = 0
    let prev = element.previousElementSibling
    while (prev) {
        // offsetWidth와 함께 마진 값을 추가
        sum += prev.offsetWidth
        const style = window.getComputedStyle(prev)
        sum += parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10)
        
        prev = prev.previousElementSibling
    }
    return sum
}

// 요소를 중앙에 배치하기 위한 스크롤 양을 계산하는 함수
function centerScrollAmount(element) {
    const parentWrap = element.parentElement
    let parentViewWidthHalf = parentWrap.getBoundingClientRect().width / 2
	let parentScrollWidth = parentWrap.scrollWidth
	
    let elementWidth = element.offsetWidth
    let elementMargins = parseInt(window.getComputedStyle(element).marginLeft, 10) + parseInt(window.getComputedStyle(element).marginRight, 10)
    let scrollValue = sumPrevSiblings(element) + (elementWidth + elementMargins) / 2

    let amount

    if (scrollValue <= parentViewWidthHalf) {
        amount = 0
    } else if (parentScrollWidth - scrollValue <= parentViewWidthHalf) {
        amount = parentScrollWidth
    } else {
        amount = scrollValue - parentViewWidthHalf
    }
    return amount
}

// 스크롤 값을 설정하는 함수
function setScrollLeft(el, smooth = 'auto') {
	let scrollAmount = centerScrollAmount(el)
	let menuUl = el.parentElement
	menuUl.scrollTo({
		left: scrollAmount,
		behavior: smooth
	})
}
// 스크롤 이벤트 과도한 발생 방지용 함수
const throttle = (func, limit) => {
	let lastFunc
	let lastRan
	
	return function() {
		const context = this
		const args = arguments
		if (!lastRan) {
			func.apply(context, args)
			lastRan = Date.now()
		} else {
			clearTimeout(lastFunc)
			lastFunc = setTimeout(function() {
				if ((Date.now() - lastRan) >= limit) {
					func.apply(context, args)
					lastRan = Date.now()
				}
			}, limit - (Date.now() - lastRan))
		}
	}
}
const isMobile = () => { return window.innerWidth <= 768 }

function useMobileFixMenu(elFix) {
	if ($(elFix).length == 0) return
	let container = $('#container')
	
	function setSnbFix() {
		if (isMobile()) {
			$(container).css('margin-top', '85px')
		} else {
			$(container).attr('style', '')
		}
	}

	$(window).on('load resize orientationchange', function () {
		setSnbFix()
	});
	setSnbFix()
}

//Header Scroll Fixed
function initHeaderFixed() {
	let headerWrap = $('#header-wrap')
	let isActived
	let headerOffsetTop
	let isFixed

	function setValue() {
		headerOffsetTop = $(headerWrap).offset().top
		isActived = headerOffsetTop <= $(window).scrollTop()
	}
	function setHeaderPosition() {
		if (isFixed !== isActived) {
			if (isActived) {
				$(headerWrap).addClass('fixed');
			} else {
				$(headerWrap).removeClass('fixed');
			}
			isFixed = isActived
		}
	}
	$(window).on('load resize orientationchange', function () {
		setHeaderPosition()
	});

	$(window).on('scroll', function () {
		isActived = headerOffsetTop <= $(window).scrollTop()
		setHeaderPosition()
	});

	setValue()
}

//GNB G Navi
function initGnbGnavi() {
	let header = $('header#header');
	let btnGnb = header.find('button.btn-gnb');
	let gnb = header.find('nav.gnb-wrap');
	let gNavi = gnb.find('>ul.g-navi');
	let gnItem = gNavi.find('>li');
	let deps2Navi = gnItem.find('>.deps2');
	let d2nList = deps2Navi.find('>ul');
	let moGnbOpenIs = false;
	let deviceWidth;
	let isMobile
	
	function setValue() {
		isMobile = window.innerWidth <= 1279 ? 'mo' : 'pc'
	}

	$(window).on('load resize orientationchange', function () {
		setValue()
		if ($(window).width() > 1279 && isMobile != 'mo') {
			moGnbOpenIs = false;
			btnGnb.removeClass('close').addClass('open');
			gnb.removeAttr('style');
			$('body').removeAttr('style')
		} else if (isMobile && deviceMode != 'pc') {
			// $(gnb).removeAttr('style')
		}
	});

	/* (변경) 오버 시 */
	gnItem.find('>a').on({
		mouseenter: function () {
			if (isMobile == 'pc') {
				if ($(this).hasClass('on') == false && $(this).parent().find('.deps2').length > 0) {
					gnItem.find('>a').removeClass('on');
					deps2Navi.removeAttr('style');

					$(this).addClass('on');
					$(this).next('.deps2').show();
				}

				if ($(this).hasClass('on') == false && !$(this).parent().find('.deps2').length > 0) {
					$('.deps2').hide();
				}

				return false;
			}
		},
		mouseleave: function (e) {
			if (isMobile == 'pc') {
				$(this).removeClass('on');
			}
		},
	});
	gnItem
		.find('>a')
		.next('.deps2')
		.on({
			mouseleave: function (e) {
				if (isMobile == 'pc') {
					$(this).prev().removeClass('on');
					$(this).hide();
				}
			},
		});

	deps2Navi.find('a').on('click', function (e) {
		e.stopPropagation();
	});

	$('html,body').on('click', function () {
		if (isMobile == 'pc') {
			gnItem.find('>a').removeClass('on');
			deps2Navi.removeAttr('style');
		}
	});

	$(window).on('scroll', function () {
		if (isMobile == 'pc') {
			gnItem.find('>a').removeClass('on');
			deps2Navi.removeAttr('style');
		}
	});

	btnGnb.on('click', function () {
		if (moGnbOpenIs == false) {
			gnb.show();
			gnb.animate({
				left: '0px',
			});
			$(this).removeClass('open').addClass('close');
			$('body').css({'height': '100vh', 'overflow': 'hidden'})
			moGnbOpenIs = true;
		} else if (moGnbOpenIs == true) {
			gnb.animate(
				{
					left: '100%',
				},
				function () {
					gnb.removeAttr('style');
				}
			);
			$(this).removeClass('close').addClass('open');
			$('body').removeAttr('style')
			moGnbOpenIs = false;
		}
	});

	setValue()
}

//set quickmenu + Contents LNB
function initQuickMenu() {
	let btnTop = $('#quick-menu ul>li>a.btn.top');
	btnTop.on('click', function () {
		$('html,body').animate(
			{
				scrollTop: 0,
			},
			300
		);
	});
}
function initFixElements() {
	const wrap = document.querySelector('#container')
	const header = document.querySelector('#header-wrap')
	const quickMenu = document.querySelector('#quick-menu')
	const lnb = document.querySelector('.lnb-wrap:not([data-scroll])') || false
	const contentFooter = document.querySelector('.content-footer') || false

	let quickMargin = quickMenu ? parseInt(window.getComputedStyle(quickMenu).bottom) : 0
	let quickLastState = ''
	let lnbLastState = ''
	let isLnbUsed = lnb ? 100 : 0

	function getHeight(element) {
		if (element) {
			return element.getBoundingClientRect().height;
		} else {
			return 0;
		}
	}

	//개별 세팅 값: lnb
	let lnbValue = () => {
		let conFHeight = getHeight(contentFooter)
		let triggerPoint = getHeight(wrap) + getHeight(header) - conFHeight
		let useContentFooter = contentFooter ? getHeight(contentFooter) : 0
		let endPosition = (getHeight(wrap) - useContentFooter) - getHeight(lnb)

		return {endPosition, triggerPoint}
	}
	//개별 세팅 값: quickMenu
	let quickValue = () => {
		let triggerPoint = getHeight(wrap) + getHeight(header)
		let setcorrection = isLnbUsed
		let endPosition = triggerPoint - (getHeight(quickMenu) + quickMargin + setcorrection)
		let bottomValue = isLnbUsed + quickMargin 

		return {endPosition, triggerPoint, bottomValue }
	}
	//공통 세팅 값
	let setValue = (tVal) => {
		let value = tVal
		let winY = window.scrollY
		let winViewBottom = winY + window.innerHeight
		let isActived = false
		let endPosition = value.endPosition
		let bottomValue = value.bottomValue

		if (winViewBottom >= value.triggerPoint) {
			isActived = true
		} else {
			isActived = false
		}
		return { isActived, endPosition, bottomValue}
	}

	function setElementPosition(element, value) {
		if (element == false) return

		const styles = {
			position: 'absolute',
			bottom: 'unset',
			top: `${value.endPosition}px`
		};

		if (value.isActived) {
			Object.assign(element.style, styles);
		} else {
			element.setAttribute('style', '')
			element.style.bottom = `${value.bottomValue}px`
		}
	}

	function setMenu(menuType, menuElement, isResizeEvent = false) {
		if (!menuElement) { return }
		
		let value = setValue(menuType === 'quickMenu' ? quickValue() : lnbValue())
		let lastState = menuType === 'quickMenu' ? quickLastState : lnbLastState
		
		if (isResizeEvent || lastState !== value.isActived) {
			setElementPosition(menuElement, value)
	
			if (menuType === 'quickMenu') {
				quickLastState = value.isActived
			} else if (menuType === 'lnb') {
				contentFooter && value.isActived ? menuElement.classList.add('hidden') : menuElement.classList.remove('hidden')
				lnbLastState = value.isActived
			}
		}
	}

	window.addEventListener('scroll', () => {
		setMenu('quickMenu', quickMenu)
		setMenu('lnb', lnb)
	})

	window.addEventListener('resize', () => {
		setMenu('quickMenu', quickMenu, true)
		setMenu('lnb', lnb, true)
	})

	setMenu('quickMenu', quickMenu)
	setMenu('lnb', lnb)

}
function setPosition(element, value) {
	if (element == false) return

	const elementIs = element.classList.contains('lnb-wrap')
	const topValue = elementIs ? value.setLnbTop : value.setQuickTop;
	const bottomValue = !elementIs ? value.setQuickBottom : 0

	const styles = {
		position: 'absolute',
		bottom: 'unset',
		top: `${topValue}px`
	};
	
	if (value.isActived) {
		Object.assign(element.style, styles);
	} else {
		element.setAttribute('style', '')
		element.style.bottom = `${bottomValue}px`
	}
}

//data-menu 이벤트 정의
function dataMenuEvent() {
	const menus = document.querySelectorAll('[data-menu]')
	if (menus == null) return
	menus.forEach(menu => {
		const menuUl = menu.querySelector('ul') || menu
		const links = menu.querySelectorAll('a')
		let activeLink = menu.querySelector('a.active')
	
		const btns = $(menu).find('button:not(.snb-fake-label)')
		const activeBtn = $(menu).find('button.active')
	
		const breakPoint = 768
		let winWidth = window.innerWidth
		let winHeight = window.innerHeight
		let isMobile = breakPoint >= winWidth
		let lastState = false
		
		if (menu.dataset.menu === 'scroll') { //1. data-menu="scroll"
			let menuScrollWidth = menuUl.scrollWidth
			if (menuScrollWidth > winWidth) {
				// setScrollLeft(activeLink.parentElement)
			}
			window.addEventListener('resize', () => {
				if (menuScrollWidth > winWidth) {
					setScrollLeft(activeLink.parentElement)
				}
			})
	
			links.forEach(link => {
				link.addEventListener('click', () => {
					activeLink = link
					const sibs = siblings(activeLink.parentElement)
					for (let i = 0; i < sibs.length; i++) {
						sibs[i].querySelector('a').classList.remove('active')
					}
					activeLink.classList.add('active')
					setScrollLeft(link.parentElement, 'smooth')
				})
			})
			setScrollLeft(activeLink.parentElement)
		} else if (menu.dataset.menu === 'dropdown') { //2. data-menu="dropdown"
			//시작 이벤트
			let fakeLabel = $(menu).find('.snb-fake-label')
			let deps2 = $(activeBtn).next('.snb-menu-2deps')
			let mobileSubmenu = $(menu).find('.snb-menu')
	
			$(deps2).slideDown(0)
	
			//클릭 이벤트
			$(btns).on('click', function (e) {
				deps2 = $(e.target).next('.snb-menu-2deps')
	
				if ($(e.target).hasClass('active')) {
					$(e.target).removeClass('active')
					$(deps2).slideUp(200)
				} else {
					$(e.target).addClass('active')
					$(deps2).slideDown(200)
				}
			})
			$(links).on('click', function (e) {
				$(links).removeClass('active')
				$(e.target).addClass('active')
	
			})
			$(fakeLabel).on('click', function (e) {
				if ($(fakeLabel).hasClass('active')) {
					$(fakeLabel).removeClass('active')
					$(mobileSubmenu).slideUp(200)
				} else {
					$(fakeLabel).addClass('active')
					$(mobileSubmenu).slideDown(200)
				}
			})
	
			function setDeviceStyle(isMo) {
				if (!isMo) {
					$(mobileSubmenu).attr('style', '')
				} else {
					$(mobileSubmenu).css('max-height', `${winHeight * 0.3}px`)
				}
			}
	
			//리사이즈 이벤트
			$(window).on('resize', function () {
				winWidth = window.innerWidth
				isMobile = breakPoint >= winWidth
	
				if (isMobile !== lastState) {
					setDeviceStyle(isMobile)
					lastState = isMobile
				}
			})
			setDeviceStyle(isMobile)
		}
	})
}

//Footer rolling list
// 필요 : clearInterval(), mouseover(), mouseleave()
function initrllLst(listTag,listIdx) {
	var hgtlst = 0;
	var boxlst = $(listTag).find("ul");
	var isAnimated = true
	var rollTime = 1200
	var delayTime = 800

	function rollingList() {
		boxlst.animate({ "top": - hgtlst }, rollTime, function () {
			boxlst.append($(listTag).find("li").first().clone());
			boxlst.css("top","0px");
			$(listTag).find("li").first().remove();
		});
	}
	
	function checkAnimationStatus() {
		rollingList()
		var intervalId = setInterval(function () {
			if (isAnimated) {
				rollingList()
			}
		}, rollTime + delayTime)
		return intervalId
	}
	
	$(listTag).on('mouseenter', function() {isAnimated = false})
	$(listTag).on('mouseleave', function() {isAnimated = true})
	
	
	hgtlst = $(listTag).find("li").outerHeight();
	$(listTag).css("height", hgtlst * listIdx);

	var rollingIntervalId = checkAnimationStatus()
}

//Footer Language
function initLanguageList() {
	var langWrap = $('.f-language');
	var langButton = $(langWrap).find('.btn-menu');
	var langList = $(langWrap).find('.menu');

	$(langButton).on('click', function () {
		if (!$(langWrap).hasClass('active')) {
			$(langWrap).addClass('active');
			$(langList).slideDown(300);
		} else {
			$(langWrap).removeClass('active');
			$(langList).slideUp(300);
		}
	});
}

// scroll animation util
function increase(counter, duration) {
	const  updateCounter = () => {
		const target = +Number(counter.dataset.counter)
		const c = +counter.innerText

		const increment = target / duration
		if(c < target) {
			counter.innerText = `${Math.ceil(c + increment)}`
			setTimeout(updateCounter, 1) 
		}
	}
	updateCounter()
}
function increaseAnimation(increaseEl) {
	const counters = increaseEl.querySelectorAll('[data-counter]')

	counters.forEach(counter => {
		counter.innerText = '0'
		const parent = counter.closest('[class*="delay-"]')
		let totalDelay
		let isShort = counter.dataset.counter < 10
		let duration = 8000
		let delayCorrection = isShort ? 50 : -200

		if (parent) {
			const style = getComputedStyle(parent)
			const transitionDelay = parseFloat(style.transitionDelay) || 0
			const transitionDuration = parseFloat(style.transitionDuration) || 0

			totalDelay = (transitionDelay + transitionDuration) * 1000 + delayCorrection
			
		} else {
			totalDelay = 0
		}

		isShort ? duration = 30000 : duration

		setTimeout(() => {
			increase(counter, duration)
		}, totalDelay)
	})
}

// scroll animation setting
function scrollTriggerAnimation() {
	const scrollAniEls = document.querySelectorAll('[data-animation]')
	if (scrollAniEls.length == 0) return

	let winY = window.scrollY
	let winStartPoint = (winY) => winY + (window.innerHeight * 0.7)
	let isEnd = false

	function init() {
		winY = window.scrollY
		winStart = winStartPoint(winY)

		if (!isEnd) {	
			scrollAniEls.forEach(ani => {
				const rect = ani.getBoundingClientRect()
				let targetTop = winY + rect.top
	
				if (winStart > targetTop && winY < targetTop) {
					if (!ani.classList.contains('active')) {
						ani.classList.add('active')
						if (ani.dataset.animation == 'increase') {
							increaseAnimation(ani)
						}
					}
				}
			})
			document.querySelectorAll('[data-animation]:not(.active)').length == 0 ? isEnd = true : ''
		}
	}

	window.addEventListener('scroll', throttle(init, 150))
	init()
}

function marquee() {
	const bannerEl = document.querySelector('.marquee-banner')
	if (!bannerEl) return

	const list = bannerEl.querySelector('.partners-list')
	const targets = list.querySelectorAll('.marquee-part')

	function animateTarget(target) {
		let distance = 100
		let currentX = 0
		function animate() {
			if (currentX > -distance) {
				currentX -= 1 * 0.02 //속도 조절 (숫자 작을수록 느려지게 됩니다)
				target.style.transform = `translateX(${currentX}%)`
				requestAnimationFrame(animate)
			} else {
				target.style.transform = 'translateX(0%)'
				currentX = 0
				requestAnimationFrame(animate)
			}
		}
		animate()
	}
	
	targets.forEach(target => {
		animateTarget(target)
	})
}

$(document).ready(function () {
	initGnbGnavi(); //GNB G-Navi
	initQuickMenu() //Quick Menu event
	initrllLst($(".f-notice"),1);
	initLanguageList();
});


window.addEventListener('load', () => {
	useMobileFixMenu('.snb-fix')
	useMobileFixMenu('.customer .tab-underline')

	initHeaderFixed(); //Header Scroll Fixed
	initFixElements(); //Quick Menu + Contents LNB position set
	dataMenuEvent()
	scrollTriggerAnimation()
	marquee()
})