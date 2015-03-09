// 1.6 此版本做了横向、纵向，解决touchmove刚滑动时的卡顿
// 1.7 此版本添加了回调函数，touchstart、touchmove、touchend、pagend
// 1.8 此版本添加PC端的鼠标手动事件
// 1.9 此版本更新dragX，横向操作，更改了其效果，以及跟上之前与dragY一样的bug
// 2.0 整理、删除无用代码，合并x与y方向
// 2.1 横向滚动添加可不拖拽滑动，并解决横向与纵向同时滑动的问题
// 2.2 修复引入此js后不能触发点击touch的问题，却去掉touchstart与touchend的preventDefault()


function drag(parentId, sonsClass, direction, cbObj) {

	var move = document.getElementById(parentId),
		touch = {},
		screenWidth = document.body.clientWidth,
		screenHeight = document.body.clientHeight;

	touch.parent = move;
	touch.children = move.children;
	touch.len = move.children.length;
	touch.animating = false;

	move.addEventListener('touchstart', _touchstart, false);
	move.addEventListener('mousedown', _touchstart, false);

	function _touchstart(e) {

		if (!touch.animating) {
			touch.X1 = (e.touches && e.touches[0].pageX) || e.pageX;
			touch.Y1 = (e.touches && e.touches[0].pageY) || e.pageY;
			touch.deltaX = false;
			touch.deltaY = false;

			// 为了避免每次都遍历搜索，因此，此条件只执行一次
			if (!touch.current) {
				touch.now = touch.current = _findParent((e.touches && e.touches[0].target) || e.target, sonsClass);
				_init(e);
			}

			touch.prev.style.display = touch.next.style.display = 'block';

			move.addEventListener('touchmove', _touchmove, false);
			move.addEventListener('touchend', _touchend, false);

			move.addEventListener('mousemove', _touchmove, false);
			move.addEventListener('mouseup', _touchend, false);


			if (cbObj && typeof cbObj.touchstart === 'function') {
				cbObj.touchstart(touch);
			}
		}
	}

	function _touchmove(e) {
		
		e.preventDefault();

		if (!touch.animating) {
			
			touch.X2 = (e.touches && e.touches[0].pageX) || e.pageX;;
			touch.Y2 = (e.touches && e.touches[0].pageY) || e.pageY;

			touch.deltaX = touch.X2 - touch.X1;
			touch.deltaY = touch.Y2 - touch.Y1;

			if (direction == 'x' && Math.abs(touch.deltaY) >= 50) {
				move.removeEventListener('touchmove', _touchmove, false);
				move.removeEventListener('touchend', _touchend, false);
				move.removeEventListener('mousemove', _touchmove, false);
				move.removeEventListener('mouseup', _touchend, false);

				return;
			}

			if (direction == 'y') {

				touch.percent = 1 - Math.abs(touch.deltaY / screenHeight);

				if (touch.deltaY > 0) {
					touch.current.style.webkitTransformOrigin = touch.current.style.transformOrigin = 'center bottom';
					touch.now = touch.prev;
				} else {
					touch.current.style.webkitTransformOrigin = touch.current.style.transformOrigin = 'center top';
					touch.now = touch.next;
				}

				touch.current.style.webkitTransform = touch.current.style.transform = 'scale3d(' + touch.percent + ', ' + touch.percent + ', 1)';
				touch.prev.style.webkitTransform = touch.prev.style.transform = 'translate3d(0, ' + (touch.deltaY - screenHeight) + 'px, 0)';
				touch.next.style.webkitTransform = touch.next.style.transform = 'translate3d(0, ' + (touch.deltaY + screenHeight) + 'px, 0)';

			} else if (direction == 'x') {

				touch.percent = 1 - Math.abs(touch.deltaX / screenWidth) * 0.2;
				var percent = 0.8 + Math.abs(touch.deltaX / screenWidth) * 0.2;

				if (touch.deltaX > 0) {
					touch.prev.style.webkitTransformOrigin = touch.prev.style.transformOrigin = 'left center';
					touch.current.style.webkitTransformOrigin = touch.current.style.transformOrigin = 'right center';
					touch.now = touch.prev;
				} else {
					touch.next.style.webkitTransformOrigin = touch.next.style.transformOrigin = 'right center';
					touch.current.style.webkitTransformOrigin = touch.current.style.transformOrigin = 'left center';
					touch.now = touch.next;
				}

				if (cbObj && cbObj.isDragX) {

					touch.now.style.opacity = Math.abs(touch.deltaX / screenWidth) + 0.2;
					touch.now.style.webkitTransform = touch.now.style.transform = 'scale3d(' + percent + ', ' + percent + ', 1)';
					touch.current.style.webkitTransform = touch.current.style.transform = 'translate3d(' + touch.deltaX + 'px, 0, 0) scale3d(' + touch.percent + ', ' + touch.percent + ', 1)';
				}
			}

			if (cbObj && cbObj.touchmove === 'function') {
				cbObj.touchmove(touch);
			}
		}
	}

	function _touchend(e) {

		if (!touch.animating) {
			if (!touch.deltaY) {
				// 如果没有触发touchmove，则恢复为默认初始化状态
				_init(e);
			} else {
				touch.animating = true;

				if (direction == 'y') {
					// 判断滑动方向
					if (touch.deltaY > 50) {
						// 下滑
						touch.prev.style.webkitTransform = touch.prev.style.transform = 'translate3d(0, 0, 0)';
						touch.current.style.webkitTransform = touch.current.style.transform = 'scale3d(.2, .2, 1)';
						touch.prev.style.zIndex = 2;
						touch.now = touch.prev;
					} else if (touch.deltaY < -50) {
						// 上滑
						touch.next.style.webkitTransform = touch.next.style.transform = 'translate3d(0, 0, 0)';
						touch.current.style.webkitTransform = touch.current.style.transform = 'scale3d(.2, .2, 1)';
						touch.next.style.zIndex = 2;
						touch.now = touch.next;
					} else {
						// 滑动范围在 -50 < y < 50 之间
						touch.current.style.webkitTransform = touch.current.style.transform = 'scale3d(1, 1, 1)';
						touch.prev.style.webkitTransform = touch.prev.style.transform = 'translate3d(0 ,-' + screenHeight + 'px, 0)';
						touch.next.style.webkitTransform = touch.next.style.transform = 'translate3d(0 ,' + screenHeight + 'px, 0)';
					}
				} else if (direction == 'x') {
					if (touch.deltaX > 30) {
						// 右滑
						touch.prev.style.opacity = 1;
						touch.prev.style.webkitTransform = touch.prev.style.transform = 'scale3d(1, 1, 1)';
						touch.current.style.webkitTransform = touch.current.style.transform = 'translate3d(' + screenWidth + 'px, 0, 0)';
						touch.now = touch.prev;
					} else if (touch.deltaX < -30) {
						// 左滑
						touch.next.style.opacity = 1;
						touch.next.style.webkitTransform = touch.next.style.transform = 'scale3d(1, 1, 1)';
						touch.current.style.webkitTransform = touch.current.style.transform = 'translate3d(-' + screenWidth + 'px, 0, 0)'
						touch.now = touch.next;
					} else {
						// 滑动范围在 -50 < y < 50 之间
						touch.current.style.webkitTransform = touch.current.style.transform = 'scale3d(1, 1, 1)';
						touch.prev.style.webkitTransform = touch.prev.style.transform = 'scale3d(.8, .8, .8)';
						touch.next.style.webkitTransform = touch.next.style.transform = 'scale3d(.8, .8, .8)';
					}
				}
				
				// 设置过度时间
				touch.current.style.webkitTransition =  touch.prev.style.webkitTransition = touch.next.style.webkitTransition = 'all .4s ease-out';
				touch.current.style.transition = touch.prev.style.transition = touch.next.style.transition = 'all .4s ease-out';


				// 动画结束，恢复原状
				function _transitionEnd(){

					touch.current.removeEventListener('transitionend', _transitionEnd, false);
					touch.current.removeEventListener('webkitTransitionEnd', _transitionEnd, false);

					// 恢复过渡时间，设空
					touch.current.style.webkitTransition = touch.current.style.transition = '';
					touch.prev.style.webkitTransition = touch.prev.style.transition = '';
					touch.next.style.webkitTransition = touch.next.style.transition = '';

					// 判断方向，并根据对应方向，恢复成初始状态
					if (direction == 'y') {
						if (touch.deltaY > 50) {
							// 往下滑动时，prev变成current，current变成next，next变无状态
							touch.prev.style.webkitTransform = touch.prev.style.transform = '';
							touch.next.style.webkitTransform = touch.next.style.transform = '';
							touch.next.style.display = 'none';
							
							touch.current = touch.prev;

						} else if (touch.deltaY < -50) {
							// 往上滑动时，next变成current，current变成prev，prev变成无状态
							touch.next.style.webkitTransform = touch.next.style.transform = '';
							touch.prev.style.webkitTransform = touch.prev.style.transform = '';
							touch.prev.style.display = 'none';

							touch.current = touch.next;
						}
					} else if (direction == 'x') {
						if (touch.deltaX > 30) {
							// 往下滑动时，prev变成current，current变成next，next变无状态
							touch.prev.style.webkitTransform = touch.prev.style.transform = '';
							touch.next.style.webkitTransform = touch.next.style.transform = '';
							touch.next.style.opacity = 0;
							touch.next.style.display = 'none';
							
							touch.current = touch.prev;

						} else if (touch.deltaX < -30) {
							// 往上滑动时，next变成current，current变成prev，prev变成无状态
							touch.next.style.webkitTransform = touch.next.style.transform = '';
							touch.prev.style.webkitTransform = touch.prev.style.transform = '';
							touch.prev.style.opacity = 0;
							touch.prev.style.display = 'none';

							touch.current = touch.next;
						}
					}

					_init(e);

					touch.animating = false;
					move.removeEventListener('touchmove', _touchmove, false);
					move.removeEventListener('touchend', _touchend, false);
					move.removeEventListener('mousemove', _touchmove, false);
					move.removeEventListener('mouseup', _touchend, false);

					if (direction == 'y') {
						if ((touch.deltaY > 50 || touch.deltaY < -50) && cbObj && typeof cbObj.pagend === 'function') {
							cbObj.pagend(touch);
						}
					} else if (direction == 'x') {
						if ((touch.deltaX > 30 || touch.deltaX < -30) && cbObj && typeof cbObj.pagend === 'function') {
							cbObj.pagend(touch);
						}
					}

				} // function _transitionEnd()

				touch.current.addEventListener('webkitTransitionEnd', _transitionEnd, false);
				touch.current.addEventListener('transitionend', _transitionEnd, false);

				if (direction == 'y') {
					if ((touch.deltaY > 50 || touch.deltaY < -50) && cbObj && typeof cbObj.touchend === 'function') {
						cbObj.touchend(touch);
					}
				} else if (direction == 'x') {
					if ((touch.deltaX > 30 || touch.deltaX < -30) && cbObj && typeof cbObj.touchend === 'function') {
						cbObj.touchend(touch);
					}
				}
			} // if (!touch.deltaY)
		} // if (!touch.animating)
	} // _touchend()

	// 初始化current, prev, next
	function _init() {
		
		touch.current.style.webkitTransform = touch.current.style.transform = 'translate3d(0, 0, 0)';

		touch.prev = touch.current.previousElementSibling || touch.current.parentNode.lastElementChild;
		touch.next = touch.current.nextElementSibling || touch.current.parentNode.firstElementChild;
		
		if (direction == 'y') {

			touch.prev.style.webkitTransform = touch.prev.style.transform = 'translate3d(0, -' + screenHeight + 'px, 0)';
			touch.next.style.webkitTransform = touch.next.style.transform = 'translate3d(0, ' + screenHeight + 'px, 0)';

			touch.prev.style.display = touch.next.style.display = 'none';
			touch.prev.style.zIndex = touch.next.style.zIndex = touch.current.style.zIndex = 0;
		} else if (direction == 'x') {
			touch.prev.style.webkitTransform = touch.prev.style.transform = 'scale3d(.8, .8, 1)';
			touch.next.style.webkitTransform = touch.next.style.transform = 'scale3d(.8, .8, 1)';
			touch.prev.style.opacity = touch.next.style.opacity = 0;

			touch.prev.style.display = touch.next.style.display = 'none';
			touch.prev.style.zIndex = touch.next.style.zIndex = 0;
			touch.current.style.zIndex = 2;
		}
	} // _init()
} // dragY()




function _findParent(element, className) {
	if (element){
		if (!hasClass(element, className)) {
			// return arguments.callee(element.parentNode, className);
			return _findParent(element.parentNode, className);
		} else {
			return element;	
		}
	}
}

/*
 * 功能：判断某标签是否有某一类名
 * 参数：第1个参数表示某标签；第2个参数表示要判断的类名
 * 返回值：若该标签内有传入的类名返回true，否则返回false
 */
function hasClass(element, className) {
	if (element) {
		if (element.classList) {
			return element.classList.contains(className);
		} else {
			var reg = /(^\s+)|(\s+$)/g;
			
			element.className = element.className.replace(reg, "");

			var className = className.replace(reg, ""),
				arrClassName = element.className.split(" ");

			for (i in arrClassName) {
				if (arrClassName[i] == className) {
					return true;
				}
			}

			return false;
		}
	}
}

/*
 * 功能：为某标签添加类名，若有则不添加
 * 参数：第1个参数表示某标签；第2个标签表示要添加的类名
 * 返回值：添加类名后的该标签类名
 */
function addClass(element, className) {
	if (element) {
		if (element.classList) {
			element.classList.add(className);
		} else {
			var reg = /(^\s+)|(\s+$)/g;
			
			className = className.replace(reg, "");
			element.className = element.className.replace(reg, "");

			if (! hasClass(element, className)) {
				if (element.className == "") {
					element.className = className;
				} else {
					element.className += " " + className;
				}
			}

			return element.className;
		}
	}
}

/*
 * 功能：删除某标签的某类名
 * 参数：第1个参数表示某标签；第2个参数表示要删除的类名
 * 返回值：删除类名后的该标签类名
 */
function removeClass(element, className) {
	if (element) {
		if (element.classList) {
			element.classList.remove(className);
		} else {
			var reg = /(^\s+)|(\s+$)/g;
			element.className = element.className.replace(reg, "");

			var className = className.replace(reg, ""),
				arrClassName = element.className.split(" ");

			for (i in arrClassName) {
				if (arrClassName[i] == className) {
					arrClassName.splice(i, 1);
					element.className = arrClassName.join(" ");
					return element.className;
				}
			}

			return element.className;
		}
	}
}