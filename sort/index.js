const canvasHEIGHT = 600;
			const canvasWIDTH = 1200;
			const MARGIN = 10;
			const rectHEIGHT = 200;
			const rectWIDTH = 30;
			const WIDTH = rectWIDTH + MARGIN;
			const RECTNUMS = canvasWIDTH / WIDTH;
			let rectArray = [];
			let animSeq = new AnimSeq();
			let sortFuncs = {
				插入排序: insertSort,
				希尔排序: shellSort,
				起泡排序: bubbleSort,
				选择排序: selectSort,
				快速排序: quickSort,
			};

			onload = () => {
				let canvas = document.getElementById('sorting');
				canvas.width = canvasWIDTH;
				canvas.height = canvasHEIGHT;
				createArray();
			};

			function createArray() {
				if (!animSeq.isEnd) {
					return;
				}
				let n = 0;
				let canvas = document.getElementById('sorting');
				let ctx = canvas.getContext('2d');
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				rectArray = [];
				while (n < RECTNUMS) {
					let num = Math.floor(Math.random() * 180) + 20;
					let temp = new Rect(num, ctx, n * (MARGIN + rectWIDTH), rectHEIGHT, rectWIDTH, num);
					temp.show();
					rectArray.push(temp);
					n++;
				}
			}

			function sort(event) {
				let sortName = event.target.value;
				if (animSeq.isEnd) {
					animSeq.clear();
					animSeq = sortFuncs[sortName]();
					animSeq.isEnd = false;
					animSeq.start();
				}
			}

			function insertSort() {
				let temp,
					len = rectArray.length;
				animSeq.push(new Animation(rectArray[0], 'toReady', true));
				for (let i = 1; i < len; i++) {
					temp = rectArray[i];
					animSeq.push(new Animation(temp, 'moveY', rectHEIGHT));
					for (var k = i - 1; k >= 0; k--) {
						if (rectArray[k].value > temp.value) {
							animSeq.push(new Animation(rectArray[k], 'moveX', WIDTH));
							animSeq.push(new Animation(temp, 'moveX', -WIDTH));
							rectArray[k + 1] = rectArray[k];
						} else {
							break;
						}
					}
					animSeq.push(new Animation(temp, 'moveY', -rectHEIGHT));
					animSeq.push(new Animation(temp, 'toReady', true));
					rectArray[k + 1] = temp;
				}
				return animSeq;
			}

			function shellSort() {
				let len = rectArray.length;
				let width = Math.floor(len / 2);
				let temp;
				while (width > 0) {
					for (var i = width; i < len; i++) {
						temp = rectArray[i];
						animSeq.push(new Animation(temp, 'moveY', rectHEIGHT));
						for (var k = i - width; k >= 0; k -= width) {
							if (rectArray[k].value > temp.value) {
								animSeq.push(new Animation(rectArray[k], 'moveY', -rectHEIGHT));
								animSeq.push(new Animation(rectArray[k], 'moveX', WIDTH * width));
								animSeq.push(new Animation(rectArray[k], 'moveY', rectHEIGHT));
								animSeq.push(new Animation(temp, 'moveX', -WIDTH * width));
								rectArray[k + width] = rectArray[k];
							} else {
								break;
							}
						}
						animSeq.push(new Animation(temp, 'moveY', -rectHEIGHT));
						rectArray[k + width] = temp;
					}
					width = Math.floor(width / 2);
				}
				return animSeq;
			}

			function quickSort() {
				let lo,
					hi,
					range,
					stack = []; // 用栈模拟递归
				stack.push([0, rectArray.length - 1]);
				while (stack.length != 0) {
					range = stack.pop();
					lo = range[0];
					hi = range[1];
					if (hi - lo >= 1) {
						let mi = getPivot(rectArray, lo, hi);
						stack.push([lo, mi - 1]);
						stack.push([mi + 1, hi]);
					}
				}
				return animSeq;

				function getPivot(rectArray, lo, hi) {
					let temp = rectArray[lo];
					let a = lo;
					animSeq.push(new Animation(temp, 'moveY', rectHEIGHT));
					while (lo < hi) {
						while (lo < hi && rectArray[hi].value >= temp.value) {
							hi--;
						}
						animSeq.push(new Animation(rectArray[hi], 'moveY', -rectHEIGHT));
						animSeq.push(new Animation(rectArray[hi], 'moveX', -WIDTH * (hi - lo)));
						animSeq.push(new Animation(rectArray[hi], 'moveY', rectHEIGHT));
						rectArray[lo] = rectArray[hi];
						while (lo < hi && rectArray[lo].value < temp.value) {
							lo++;
						}
						animSeq.push(new Animation(rectArray[lo], 'moveY', -rectHEIGHT));
						animSeq.push(new Animation(rectArray[lo], 'moveX', WIDTH * (hi - lo)));
						animSeq.push(new Animation(rectArray[lo], 'moveY', rectHEIGHT));
						rectArray[hi] = rectArray[lo];
					}
					animSeq.push(new Animation(temp, 'moveX', WIDTH * (lo - a)));
					animSeq.push(new Animation(temp, 'moveY', -rectHEIGHT));
					rectArray[lo] = temp;
					animSeq.push(new Animation(rectArray[lo], 'toReady', true));
					return lo;
				}
			}

			function bubbleSort() {
				let temp,
					n = rectArray.length;
				while (n > 0) {
					for (var i = 0; i < n - 1; i++) {
						if (rectArray[i].value > rectArray[i + 1].value) {
							animSeq.push(new Animation(rectArray[i], 'moveY', rectHEIGHT));
							animSeq.push(new Animation(rectArray[i + 1], 'moveX', -WIDTH));
							animSeq.push(new Animation(rectArray[i], 'moveX', WIDTH));
							animSeq.push(new Animation(rectArray[i], 'moveY', -rectHEIGHT));

							temp = rectArray[i];
							rectArray[i] = rectArray[i + 1];
							rectArray[i + 1] = temp;
						}
					}
					animSeq.push(new Animation(rectArray[i], 'toReady', true));
					n--;
				}
				return animSeq;
			}

			function selectSort() {
				let temp,
					n = rectArray.length;
				while (n > 0) {
					for (var max = 0, i = 1; i < n; i++) {
						max = rectArray[i].value > rectArray[max].value ? i : max;
					}
					if (max == n - 1) {
						animSeq.push(new Animation(rectArray[max], 'moveY', rectHEIGHT));
						animSeq.push(new Animation(rectArray[max], 'moveY', -rectHEIGHT));
						animSeq.push(new Animation(rectArray[max], 'toReady', true));
					} else {
						animSeq.push(new Animation(rectArray[max], 'moveY', rectHEIGHT));
						animSeq.push(new Animation(rectArray[max], 'moveX', WIDTH * (n - 1 - max)));
						animSeq.push(new Animation(rectArray[n - 1], 'moveY', -rectHEIGHT));
						animSeq.push(new Animation(rectArray[max], 'moveY', -rectHEIGHT));
						animSeq.push(new Animation(rectArray[max], 'toReady', true));
						animSeq.push(new Animation(rectArray[n - 1], 'moveX', -WIDTH * (n - 1 - max)));
						animSeq.push(new Animation(rectArray[n - 1], 'moveY', rectHEIGHT));
						temp = rectArray[max];
						rectArray[max] = rectArray[n - 1];
						rectArray[n - 1] = temp;
					}
					n--;
				}
				return animSeq;
			}