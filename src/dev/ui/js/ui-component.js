
/*리스트 동적 생성*/
function createDropdown() {
	const selects = document.querySelectorAll('.form-cont select')

	selects.forEach((select) => {
		const elParams = {
			options: select.querySelectorAll('option'),
			required: select.hasAttribute('required') ? 'required' : '',
			btnStyle: select.classList.length > 0 ? select.classList : 'btn-drop-box',
			event: select.dataset.event ? select.dataset.event : 'select'
		}

		const list = makeList(elParams)
		select.insertAdjacentHTML('afterend', list)
	})
}
function makeList({ options, required, btnStyle, event }) {
	let optionTexts = []
	let selectedOptionText = ''
	let isHiddenSelected = false
	
	//리스트 컨텐츠 생성
	for (let option of options) {
		if (option.selected) {
			selectedOptionText = option.innerText
			if (option.hidden) {
				isHiddenSelected = true
			}
		}

		if (option.hidden) {
			continue
		}

		optionTexts.push({ text: option.innerText, value: option.value })
	}
	const listItems = optionTexts.map(({ text, value }) => {
		const isSelected = text === selectedOptionText ? "active" : ""
		return `<li><a href="#" data-value="${value}" class="${isSelected}">${text}</a></li>`
	}).join('')

	//버튼 컨텐츠 생성
	const buttonContent = isHiddenSelected ? `<span ${`class="${required}"`}>${selectedOptionText}</span>` : selectedOptionText
	
	const createDropdown = `
		<div class="form-drop-box">
			<button type="button" class="${btnStyle}" data-event="${event}">
				${buttonContent}
			</button>
			<ul class="drop-list">
				${listItems}
			</ul>
		</div>
	`

	return createDropdown
}
/*dropdown list (이벤트 위임 수정)*/
function dropdownList() {
	function setDropdownEvent(target, eventValue) {
		const parentElement = target.closest('.form-drop-box')
		const value = target.dataset.value

		/*active 클래스 세팅 */
		const allLinks = Array.from(parentElement.querySelectorAll('a'))
		const otherLinks = allLinks.filter(a => a !== target)

		for (let i = 0; i < otherLinks.length; i++) {
			otherLinks[i].classList.remove('active')
		}
		target.classList.add('active')

		/*list 닫기*/
		const firstButton = parentElement.querySelector('[data-event]')
		const quantityInput = target.closest('.form-cont') ? target.closest('.form-cont').querySelector('input[class^=inp-]') : null
		openEvent(firstButton, false)

		/*eventValue 별 이벤트 정의*/
		switch (eventValue) {
			case 'dropdown':
				changedText(firstButton, target)
				break;
			
			case 'select':
				selectSet(parentElement, value)
				changedText(firstButton, target)
				break;
			
			case 'quantity':
				selectSet(parentElement, value)
				changedText(quantityInput, target)
				break;
			
			default:
				break;
		}
	}

	//list - open / close & class set
	function openEvent(target, isOpen) {
		var parent = target.parentElement
		var list = ''

		if (parent.classList.contains('form-drop-box')) {
			list = parent.querySelector('.drop-list')
		} else if(parent.tagName === 'LI') {
			list = parent.querySelector('ul')
		}

		if (isOpen) {
			$(target).addClass('open')
			$(list).slideDown()
		} else {
			$(target).removeClass('open')
			$(list).slideUp()
		}
	}

	//select tag update
	function selectSet(el, value) {
		const targetSelect = el.parentElement.querySelector('select')

		if (value === 'select-clear') {
			Array.from(targetSelect.options).forEach(option => {
				option.removeAttribute('selected')
				option.selected = false
			})
			targetSelect.value = ''  // select 요소의 값 초기화
		} else {
			const changeOption = targetSelect.querySelector(`option[value="${value}"]`)
	
			if (changeOption) {
				Array.from(targetSelect.options).forEach(option => {
					option.removeAttribute('selected')
					option.selected = false
				})
				changeOption.setAttribute('selected', 'selected')
				changeOption.selected = true
			}
		}
		languageChange(value);
	}
	//select 태그 업데이트 시, list update
	function reverseSelect() {
		const selects = document.querySelectorAll('.form-cont select')
		
		selects.forEach(select => {
			const parent = select.closest('.form-cont')

			//text value 변경요소
			const inputElement = parent.querySelector('.inp-dropbox') || parent.querySelector('.inp-line')
			const dropBtn = parent.querySelector('button[data-event]')
			
			select.addEventListener('change', e => {
				//list active
				const dropListElement = parent.querySelector(`.drop-list [data-value="${select.value}"]`)
				const parentSibs = siblings(dropListElement.closest('li'))

				for (let i = 0; i < parentSibs.length; i++) {
					parentSibs[i].querySelector('a').classList.remove('active')
				}
				dropListElement.classList.add('active')

				//input && button text change
				if (inputElement) { inputElement.value = select.value }
				dropBtn.innerText = select.value
			})
		})
	}

	function listDropdown(target) {
		let open = target.classList.contains('open') ? true : false
		!open ? openEvent(target, true) : openEvent(target, false)
	}

	//text 변경 함수
	function changedText(changeEl, target) {
		let valueText = target.innerText

		if (changeEl.tagName === 'BUTTON') {
			changeEl.innerText = valueText
		} else if (changeEl.tagName === 'INPUT') {
			changeEl.value = valueText
		}
	}

	function init() {
		//dropdown click event 정의
		document.addEventListener('click', function (event) {
			const eventTarget = event.target
			const isDropDown = eventTarget.getAttribute('data-event')
			const isTagNameA = eventTarget.tagName === 'A'

			if (isDropDown) {
				listDropdown(eventTarget)

				//본인 제외하고 나머지 전부 닫기
				const openEls = document.querySelectorAll('.form-drop-box > [data-event].open')
				if (openEls.length !== 0 && eventTarget.parentElement.tagName !== 'LI') {
					let otherOpenEls = Array.from(openEls).filter(el => el !== eventTarget)
					otherOpenEls.forEach(other => {
						openEvent(other, false)
					})
				}
			}

			if (isTagNameA && eventTarget.closest('.drop-list')) {
				event.preventDefault()

				const parent = eventTarget.closest('.form-drop-box')
				const eventValue = parent.querySelector('[data-event]').dataset.event

				setDropdownEvent(eventTarget, eventValue)
			}

			if (!isTagNameA && !isDropDown) {
				let openEls = document.querySelectorAll('[data-event].open')

				openEls.forEach(openEl => {
					openEvent(openEl, false)
				})
			}
		})

		//select 값 업데이트 시 dropdown 에 반영
		reverseSelect()
	}
	init()
}

const domHTML = document.querySelectorAll('html');

/* 다국어 변경 시 */
function languageChange(value) {
	domHTML.forEach((el) => {
		localStorage.setItem('lang', value);
		el.setAttribute('lang', localStorage.getItem('lang'));

		languageInit();
	});

	document.querySelectorAll('.f-language .drop-list li a').forEach((el) => {
		if (el.classList.contains('active')) {
			localStorage.setItem('languageClass', 'active');
		}
	});
}

/* 다국어 lang 초기값 저장 */
function languageInit() {
	domHTML.forEach((htmlEle) => {
		htmlEle.setAttribute('lang', localStorage.getItem('lang'));

		let langData = htmlEle.getAttribute('lang');

		document.querySelectorAll('.f-language .drop-list li a').forEach((fnbDropListEle) => {
			let languageClassName = localStorage.getItem('languageClass');

			document.querySelectorAll('.f-language .btn-drop-box').forEach((fnbBtnDropBoxEle) => {
				if (langData === 'ko') {
					htmlEle.className = 'fam-ko';
					if (fnbDropListEle.classList.contains('active')) {
						fnbDropListEle.classList.add(languageClassName);
						fnbBtnDropBoxEle.textContent = '한국어';
					}
					if (fnbDropListEle.getAttribute('data-value') === 'ko') {
						fnbDropListEle.classList.add(languageClassName);
					}
				} else if (langData === 'en') {
					htmlEle.className = 'fam-en';
					if (fnbDropListEle.classList.contains('active')) {
						fnbDropListEle.classList.add(languageClassName);
						fnbBtnDropBoxEle.textContent = 'English';
					}
					if (fnbDropListEle.getAttribute('data-value') === 'en') {
						fnbDropListEle.classList.add(languageClassName);
					}
				} else if (langData === 'ja') {
					htmlEle.className = 'fam-ja';
					if (fnbDropListEle.classList.contains('active')) {
						fnbDropListEle.classList.add(languageClassName);
						fnbBtnDropBoxEle.textContent = '日本語';
					}
					if (fnbDropListEle.getAttribute('data-value') === 'ja') {
						fnbDropListEle.classList.add(languageClassName);
					}
				} else {
					htmlEle.setAttribute('lang', 'ko');
					htmlEle.className = 'fam-ko';
				}
			});
		});
	});
}

/*tab*/
function setTabs() {
	const stringSelectors = '[data-tab-index] a, [data-tab-index] input'
	const indexWraps = document.querySelectorAll('[data-tab-index]')
	const selectEl = document.querySelectorAll(stringSelectors)
	const tabRounds = document.querySelectorAll('.tab-round')
	
	//.tab-round
	tabRounds.forEach(tab => {
		let tabRoundResize = false
		let setBgTarget = tab.querySelector('a.active').closest('li')

		const bg = tab.querySelector('.tab-round-bg')
		setRoundBg({target: setBgTarget, tabRoundResize})
	})

	//.tab-round background start settings
	function setRoundBg({ target, tabRoundResize = false, isAnimated = false }) {
		const bg = target.parentElement.querySelector('li.tab-round-bg')
		if (!tabRoundResize) {
			let setBgWidth = target.getBoundingClientRect().width
			bg.style.width = `${setBgWidth}px`
			tabRoundResize = true
		}

		if (isAnimated) {
			bg.style.transition = 'left 0.3s ease'
		}

		let setBgLeft = sumPrevSiblings(target)
		bg.style.left = `${setBgLeft}px`
	}

	window.addEventListener('resize', () => {
		tabRounds.forEach(tab => {
			let setBgTarget = tab.querySelector('a.active').parentElement
			setRoundBg({target: setBgTarget, tabRoundResize: false})
		})
		indexWraps.forEach(wrap => {
			let activeBtn = wrap.querySelector('a.active')
			if (activeBtn == null) return
			setScrollLeft(activeBtn.parentElement)
		})
	})

	function childReset(els) {
		if (els == null) return
		
		let el = els.querySelector('li')
		let sibs = siblings(el)
		el.querySelector('a').classList.add('active')
		for (let i = 0; i < sibs.length; i++) {
			sibs[i].querySelector('a').classList.remove('active')
		}
	}

	//click event
	selectEl.forEach((target) => {
		target.addEventListener('click', (e) => {
			const tabBtn = e.target.closest('a') || e.target.closest('input')
			const currentTabName = tabBtn.closest('[data-tab-index]').dataset.tabIndex

			let tabStringId

			if (tabBtn.tagName === 'A') {
				currentTabName !== 'null' ? e.preventDefault() : ''
				
				tabStringId = tabBtn.getAttribute('href')
				
				let parent = tabBtn.parentElement
				let parentSibs = siblings(parent)
	
				parentSibs.forEach(sib => {
					const btnA = sib.querySelector('a') || null
					if (btnA == null) return
					btnA.classList.remove('active')
				})
				tabBtn.classList.add('active')

				const parentWrap = tabBtn.closest(`ul`) || null
				if (parentWrap.classList.contains('tab-round')) {
					setRoundBg({ target: tabBtn.parentElement, isAnimated: true })
				}
				//ul의 스크롤 left 이동 기능
				const parentScroll = parentWrap.scrollWidth
				if (parentScroll > parentWrap.getBoundingClientRect().width) {
					setScrollLeft(tabBtn.parentElement, 'smooth')
				}
			} else {
				tabStringId = tabBtn.getAttribute('data-index')
				tabBtn.checked = true
			}

			if (currentTabName !== 'null') {
				let currentTabId = tabStringId.charAt(0) !== '#' ? '#' + tabStringId : tabStringId
				
				const currentTabContent = document.querySelector(`[data-tab-content="${currentTabName}"]`)
				const currentTabTarget = currentTabContent.querySelector(`${currentTabId}`)
				if (currentTabContent ==null) return
				setClass(currentTabTarget, 'active')

				//자식 tab의 첫번째 요소로 초기화
				const childSet = currentTabTarget.querySelector('[data-menu], [data-tab-index]')
				childReset(childSet)
			}
		})
	})

	indexWraps.forEach(wrap => {
		let activeBtn = wrap.querySelector('a.active')
		if (activeBtn == null) return
		setScrollLeft(activeBtn.parentElement)
	})
}

function setAccodion() {
	const accodionWrap = $(`[data-accordion='container']`)

	$(accodionWrap).each(function (idx, el) {
		var openHead = $(el).find(`[data-accordion='tab']`)

		$(openHead).on('click', (e) => {
			e.preventDefault()
			var target = $(e.target).closest('a')
			var isOpen = !$(target).hasClass('active')

			accodionOpen(isOpen, target)

			//아코디언 클릭 시, 버튼이 현재 화면의 30% 기준 높이로 이동
		})
	})
	
	function accodionOpen(isOpen, target) {
		
		var parent = $(target).parent()
		var truePanel = $(parent).find(`[data-accordion='panel']`)
		if ($(target).closest('.gom-card-box-defalut').length !== 0) {
			var newScroll = $(target).closest('.gom-package-item').offset().top
			$(window).scrollTop(newScroll - ($(window).innerHeight() * 0.2))
		}

		if (isOpen) {
			$(target).addClass('active')
			$(truePanel).slideDown(300)

			if ($(parent).prop('tagName') === 'LI') {
				//만약 앞의 요소가 열려 있을 때, scrollTop 보정
				var parentPrev = $(parent).prevAll('li').find('[data-accordion="tab"].active')
				updateScrollOnElementOpen(parentPrev, target)

				//다른 열려있는 요소들 모두 닫기
				sibClose(parent)
			}

		}else {
			$(target).removeClass('active')
			$(truePanel).slideUp(300)
		}

		function updateScrollOnElementOpen(prevChild, target) {
			if ($(prevChild).length == 0 || null) return
			
			var prevEl = $(prevChild).parent()
			var prevContHeight = $(prevEl).find(`[data-accordion='panel']`).height()

			if (prevContHeight > window.innerHeight) {
				var newScrollTop = $(target).offset().top - prevContHeight - (window.innerHeight * 0.3)
				$(window).scrollTop(newScrollTop)
			}
		}

		function sibClose(parent) {
			$(parent).siblings().find(`[data-accordion='tab']`).removeClass('active')
			$((parent).siblings().find(`[data-accordion='panel']`)).slideUp(300)
		}

	}

}

/*체크박스 선택*/
function setChkboxAll() {
	const agreeWrap = document.querySelectorAll('[data-agree="agree-group"]')

	agreeWrap.forEach(wrap => {
		const agreeAllCheckbox = wrap.querySelector('[data-agree="agree-all"] input')
		const checkboxes = wrap.querySelectorAll('[data-agree="agree-group"] [type="checkbox"]:not(#agree-all)')
		const subChecks = wrap.querySelectorAll('.sub-check [type="checkbox"]')

		agreeAllCheckbox.addEventListener('change', function() {
			const isChecked = this.checked

			setChecked(checkboxes, isChecked)
		})

		checkboxes.forEach(function(checkbox) {
			checkbox.addEventListener('change', function () {
				const subChecksEl = checkbox.parentElement.parentElement.querySelector('.sub-check')
				const hasSubcheck = subChecksEl == null ? false : true
				
				if (hasSubcheck) {
					setChecked(subChecksEl.querySelectorAll('[type="checkbox"]'), checkbox.checked) 
				} 

				const isAllchecked = otherCheckedAll(checkboxes)
				isAllchecked ? agreeAllCheckbox.checked = true : agreeAllCheckbox.checked = false
			})
		})

		subChecks.forEach((subs) => {
			subs.addEventListener('change', () => {
				const parentEL = subs.closest('.sub-check')
				const checkParent = parentEL.previousElementSibling.querySelector('[type="checkbox"]')
				checkParent.checked = anyChecked(subChecks)
			})
		})

		function setChecked(boxes, checkValue) {
			boxes.forEach(box => [
				box.checked = checkValue
			])
		}

		const otherCheckedAll = (checkBoxes) => Array.from(checkBoxes).every(function(checkbox) {
			return checkbox.checked
		})
		const anyChecked = (checkBoxes) => Array.from(checkBoxes).some(function(checkbox) {
			return checkbox.checked
		  })

	})
}

/*input 입력*/
function setInput() {
	function setMargin() {
		const labels = document.querySelectorAll('.form-label')
		labels.forEach(label => {
			label.closest('.form-item').classList.add('has-label')
		})
	}
	function setFakeLabel() {
		const labels = document.querySelectorAll('.fake-label')

		labels.forEach(label => {
			const parent = label.parentElement
			const input = parent.querySelector('input')
			input.addEventListener('input', () => {

				if (input.value !== '') {
					label.style.display = 'none'
				} else {
					label.style.display = 'block'
				}
			})

		})
	}
	function inputFileUpload() {
		const fileEls = document.querySelectorAll('input[type=file]')

		fileEls.forEach(file => {
			const parents = file.parentElement
			const fileLabel = parents.querySelector('.form-filename')
			const fileDefaultText = fileLabel.innerText

			file.addEventListener('change', () => {
				let hasFile = file.files.length === 0
				if (!hasFile) {
					fileLabel.classList.remove('null')
					fileLabel.innerText = file.files[0].name
				} else {
					fileLabel.innerText = fileDefaultText
				}
			})
			
		})
	}
	//라이선스 키 등록 폼
	function addInpForm() {
		const licenseForm = document.querySelectorAll('.license-form')

		function createInput(child) {
			const formItem = child.cloneNode(true)
			const addButton = formItem.querySelector('.btn-add')
			const formInput = formItem.querySelector('input[type=text]')
			addButton.classList.remove('btn-add')
			addButton.classList.add('btn-delete')
			addButton.textContent = '삭제'
			formInput.value = ''
			if (formItem.querySelector('.form-label')) {
				let label = formItem.querySelector('.form-label')
				formItem.removeChild(label)
			}
			return formItem
		}

		licenseForm.forEach(form => {
			form.addEventListener('click', function (e) {
				const target = e.target.closest('.btn-item-util')
				const firstNode = form.querySelector('.form-item')
				const childLenght = form.querySelectorAll('.form-item').length
				const maxLenght = form.dataset.maxlength

				const isMaxLength = maxLenght == childLenght + 1

				if (target) {					
					if (target.classList.contains('btn-add')) {
						if (maxLenght > childLenght) {
							form.appendChild(createInput(firstNode))
						}
						if (isMaxLength) {
							target.classList.add('disabled')
						}
					}
					else if (target.classList.contains('btn-delete')) {
						const deleteEl = target.closest('.form-item')
						form.removeChild(deleteEl)

						if (!isMaxLength) {
							form.querySelector('.btn-add.disabled') ? form.querySelector('.btn-add.disabled').classList.remove('disabled') : ''
						}
					}
					//버튼의 disabled 설정 바꾸기
					// let deleteCount = form.querySelectorAll('.btn-delete')
					// setDisable(deleteCount)
				}
			})
		})

		// function setDisable(els) {
		// 	if (els.length >= 2) {
		// 		// 삭제 버튼 개수가 2개 이상일 때, 각 요소의 disabled 클래스 삭제
		// 		for (const el of els) {
		// 			el.classList.remove('disabled')
		// 		}
		// 	} else if (els.length === 1) {
		// 		// 삭제 버튼 개수가 1개일 때, 요소에 disabled 클래스 추가
		// 		els[0].classList.add('disabled')
		// 	}
		// }
	}

	function init() {
		setFakeLabel()
		inputFileUpload()
		addInpForm()
		setMargin()
	}

	init()

}
/* 툴팁 */
function tooltip() {
	const tooltipWrap = $('.tooltip-wrap'),
		tooltipBtn = tooltipWrap.find('.tooltip-button'),
		tooltip = tooltipWrap.find('.tooltip-cont');

	$(window).on('load resize', function () {
		let win = $(window).width();
		
		if (win <= 768) {
			resetTooltip()
			//mobile
			tooltipBtn.on('click', (e) => {
				e.preventDefault();
				if(tooltipBtn.hasClass("active") !== true) {
					TooltipShow ();
				} else {
					TooltipHide ();
				}
			})
			$(document).on('click', function(e) {
				var container = tooltipWrap;
				if (!container.is(e.target) && container.has(e.target).length === 0){
					TooltipHide ();
				}	
			});
		} else {
			resetTooltip()
			//pc
			tooltipBtn.on ('mouseenter', () => {
				TooltipShow ();
			});
			tooltipBtn.on ('mouseleave', () => {
				TooltipHide ();
			});
		}

	});
	function TooltipShow() {
		tooltipBtn.addClass('active');
		tooltip.show();
	}
	function TooltipHide() {
		tooltipBtn.removeClass('active');
		tooltip.hide();
	}
	function resetTooltip() {
		tooltipBtn.off().removeClass('active');
		tooltip.removeAttr('style');
	}
}
/* 제품 리스트 삭제 */
function productRemove() {
	const productItem = $('.product-list > li'),
		btnRemove = productItem.find('.btn-product-delete');

		btnRemove.on('click', function() {
			$(this).parent().remove();
		});
}

//visual video load check
function videoSet() {	
	const visualHead = document.querySelector('.head-visual-wrap')
	if (!visualHead) return
	const visualVod = visualHead.querySelector('video')
	if (!visualVod) return
	let videoRect = visualHead.getBoundingClientRect()

	let winY = window.scrollY
	let videoPoint = videoRect.top + winY + videoRect.height //이벤트 분기점
	let isActive = winY > videoPoint
	let lastState = false

	//poster이미지 bg 처리
	let vodPoster = visualVod.getAttribute('poster')
	visualHead.style.backgroundImage = `url(${vodPoster})`

	visualVod.addEventListener('canplay', () => { // 비디오 로딩되어있을 때 재생
		visualVod.play()
		visualVod.setAttribute('autoplay', '')
		visualHead.setAttribute('style', '')
	});

	function videoScrollPause(bool) {
		if (bool) {
		//비디오 멈춤
			visualVod.pause()
			visualVod.setAttribute('autoplay', 'false')
		} else {
		//비디오 재생
			visualVod.play()
			visualVod.setAttribute('autoplay', '')
		}

	}

	window.addEventListener('scroll', (e) => {
		winY = window.scrollY
		isActive = winY > videoPoint

		if (isActive !== lastState ) {
			videoScrollPause(isActive)

			lastState = isActive
		}

	})
}

$(document).ready(function () {
	createDropdown()
	dropdownList()
	setTabs()
	setAccodion()
	setChkboxAll()
	setInput()
	tooltip()
	productRemove()
	videoSet()
	languageInit()
})