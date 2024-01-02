window.addEventListener('load', () => {
	document.querySelector('[data-role*="open__"]') && Array.prototype.forEach.call(document.querySelectorAll('[data-role*="open__"]'), el => {
		openPopup(el);
	});

	popupTodayClose();
});

function bodyFreeze(freeze) {
	if (!freeze) {
		document.body.removeAttribute('style');
		document.querySelector('html').removeAttribute('style');
		document.body.classList.remove('dimmed');
	} else {
		document.body.style.overscrollBehaviorY = 'contains';
		document.querySelector('html').style.height = '100%';
		document.querySelector('html').style.overflow = 'hidden';
		document.body.classList.add('dimmed');
	}
}

function openPopup(el) {
	if (!el.dataset) {
		return;
	}

	const _dataSet = el.dataset.role.replace('open__', '');
	// const _targetName = `../layer/${_dataSet}.html`;
	const _targetName = `${_dataSet}.html`;

	el.addEventListener('click', e => {
		e.preventDefault();

		let buttonDim =  e.currentTarget.dataset.closeLayer === 'false'

		fetch(_targetName).then(res => {
			if (!res.ok){
				throw new Error;
			}
			return res.text()
		}).then(res => {
			makeLayer(res, buttonDim);
		}).catch(err => {
			console.log(err);
		})
	});

	// 레이어 만들기
	const makeLayer = (res, isDimClosed) => {
		document.querySelector('.layer-dimmed') && document.querySelector('.layer-dimmed').remove();

		const _layer = document.createElement('div');

		_layer.className = 'layer-dimmed';
		_layer.innerHTML = res;
		isDimClosed ? _layer.setAttribute('data-close-layer', 'false') : ''
		
		$('body').append(_layer);
		setTimeout(() => {
			const _dim = _layer.querySelector('[data-dim]') && _layer.querySelector('[data-dim]').dataset.dim;

			bodyFreeze(`${_dim ? 'freeze' : ''}`);
		}, 0);

		// 레이어 닫기
		const closeLayer = () => {
			_layer.querySelector('.active') && _layer.querySelector('.active').classList.remove('active');
			setTimeout(() => {
				bodyFreeze();
				_layer.remove();
			}, 10);
		}

		// 닫기 버튼 레이어 닫기
		_layer.querySelector('.btn-close-layer') && _layer.querySelector('.btn-close-layer').addEventListener('click', () => closeLayer())
		_layer.querySelector('[data-close="closeLayer"]') && _layer.querySelector('[data-close="closeLayer"]').addEventListener('click', () => closeLayer());

		// 딤 클릭 레이어 닫기
		_layer.addEventListener('click', (e) => {
			if (_layer.dataset.closeLayer == 'false') { return }
			if (_layer.querySelector('.pop-float-layer.type-close') || e.target.nodeName === 'INPUT' || e.target.nodeName === 'BUTTON' || e.target.nodeName === 'A') {
				return;
			}

			const _cls = _layer.firstElementChild.getAttribute('class').replace('active', '').trim().split(' ').join('.');
			const _target = e.target.closest(`.${_cls}`);

			if (!e.target.classList.contains('type-del') && document.body.classList.contains('dimmed') && !_target) {
			// if (!e.target.classList.contains('type-del') && document.body.classList.contains('layer-dimmed') && !_target) {
				closeLayer();
			}
		})
	}
}

// 오늘은 그만 보기
function popupTodayClose() {
	const handleCookie = {
		setCookie: function (name, val, exp) {
			const date = new Date();

			date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
			document.cookie = name + "=" + val + ";expires=" + date.toUTCString() + ";";
		},
		getCookie: function (name) {
			const valueData = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");

			return valueData ? valueData[2] : null;
		},
	};

	if (handleCookie.getCookie('today') === 'y') {
		$('#popToday').hide();
		$('#popToday').css({
			'display': 'none',
		});
	} else {
		$('#popToday').show();
	}

	$('#popToday').on('click', '#todayClose', function () {
		if ($('input[name=todayClose]').is(':checked')) {
			handleCookie.setCookie('today', 'y', 1);
			$('#popToday').hide();
		}
	});
}

// 윈도우 팝업창
function openWindowPop(url, target) {
	let options = 'top=0, left=0, width='+screen.width+', height='+screen.height+', fullscreen=yes, status=no, menubar=no, toolbar=no, resizable=no';

	window.open(url, target, options);
}