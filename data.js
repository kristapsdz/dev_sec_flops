/**
 * All columns in order that we show in the table.  These should reference keys
 * in the article, but they may be undefined in which case the value will just
 * be empty.
 */
const columnOrder = [
	'deprecated',
	'system',
	'subsystem',
	'lang',
	'lines',
]

/**
 * Sort the articles by the value of a key property given in "index".  If
 * "numeric" is true, use numeric sorting; otherwise, lexicographic.  If "order"
 * is true, use ascending order; otherwise, descending.  Finally, "elem" is the
 * element which triggered the resort.
 */
function resort(order, elem, index, numeric = false)
{
	data.articles.sort((a, b) => {
		const def = numeric ? 0 : '';
		const vala = index in a.keys ? a.keys[index] : def;
		const valb = index in b.keys ? b.keys[index] : def;
		return (numeric && order) ?
			(Number(vala) - Number(valb)) :
			numeric ?
			(Number(valb) - Number(vala)) :
			order ?
			vala.localeCompare(valb) :
			valb.localeCompare(vala);
	});
	elem.onclick = () => resort(!order, elem, index, numeric);
	redraw();
}



function getSubsystem(name)
{
	if (typeof(name) === 'undefined')
		throw new Error('No subsystem name for source entry.');
	if (!(name in subsystems))
		throw new Error('No subsystem for ' + name + '.');
	return subsystems[name];
}

/**
 */
function drawDialog(article)
{
	const subsystem = getSubsystem(article.keys['subsystem']);

	const code = document.getElementById('code-box');
	code.innerHTML = article.article.xml;
	code.querySelectorAll('pre code').forEach((el) => {
		hljs.highlightElement(el);
	});

	const sys = document.getElementById('code-system');
	if ('system' in article.keys) {
		let elem;
		if ('system-link' in article.keys) {
			elem = document.createElement('a');
			elem.href = article.keys['system-link'];
		} else
			elem = document.createElement('span');
		elem.textContent = article.keys['system'];
		sys.replaceChildren(elem);
		sys.hidden = false;
	} else
		sys.hidden = true;

	const subsys = document.getElementById('code-subsystem');
	let elem;
	if ('link' in subsystem) {
		elem = document.createElement('a');
		elem.href = subsystem['link'];
	} else
		elem = document.createElement('span');
	elem.textContent = article.keys['subsystem'];
	subsys.replaceChildren(elem);

	const lang = document.getElementById('code-lang');
	if ('lang' in article.keys) {
		if (!('system' in article.keys) &&
		    !('subsystem' in article.keys))
			lang.textContent = article.keys['lang'];
		else
			lang.textContent = '(' + article.keys['lang'] + ')';
	} else
		lang.replaceChildren();

	const refs = [];
	for (const uri of subsystem['sources']) {
		const elem = document.createElement('li');
		const anch = document.createElement('a');
		elem.append(anch);
		anch.href = uri.trim();
		anch.textContent = uri.trim();
		refs.push(elem);
	}
	if (refs.length === 0) {
		const elem = document.createElement('li');
		elem.textContent = 'No references given.';
		refs.push(elem);
	}
	document.getElementById('code-references').replaceChildren(...refs);

	const diag = document.getElementById('code');
	diag.showModal();
}

/**
 * Draw a table column for the "key" of given article "keys" and within the
 * "subsystem" object.  Return the HTML element.
 */
function redrawColumn(subsystem, key, keys)
{
	const text = (key in keys) ? keys[key] : '';
	const link = (key === 'subsystem' && 'link' in subsystem) ?
		subsystem['link'] : (key + '-link' in keys) ?
		keys[key + '-link'] : null;
	const col = document.createElement('div');

	if (key === 'deprecated' && text.length > 0) {
		const span = document.createElement('span');
		span.innerHTML = '<i class="fa fa-exclamation-circle"></i>';
		span.title = 'Deprecated';
		col.append(span);
	} else if (link !== null) {
		const anch = document.createElement('a');
		anch.textContent = text;
		anch.href = link;
		col.append(anch);
	} else
		col.textContent = text;

	if (text.length === 0)
		col.className = 'empty';

	return col;
}

/**
 * Redraw the table of all managed sources.
 */
function redraw()
{
	const rows = [];
	for (const article of data.articles) {
		const subsys = getSubsystem(article.keys['subsystem']);
		const row = document.createElement('div');
		row.className = 'table-row';
		for (const key of columnOrder)
			row.append(redrawColumn(subsys, key, article.keys));
		const col = document.createElement('div');
		col.innerHTML = '<i class="fa fa-fw fa-code"></i>';
		col.className = 'opener';
		col.onclick = () => drawDialog(article);
		row.append(col);
		rows.push(row);
	}
	document.getElementById('table-body').replaceChildren(...rows);
}

function drawChart()
{
	const datasets = [];
	const subsystemIndex = {};
	let i = 0;
	for (const subsystem in subsystems) {
		subsystemIndex[subsystem] = i++;
		datasets.push({
			label: subsystem,
			data: [],
		});
	}

	for (const article of data.articles) {
		const name = article.keys['subsystem'];
		const subsystem = getSubsystem(name);
		let bytes = 0;
		for (const source of subsystem.sources) {
			if (!(source in subsystemSizes))
				throw new Error('Missing subsystem size: ' + source);
			bytes += subsystemSizes[source];
		}
		datasets[subsystemIndex[name]].data.push({
			'x': article.keys.lines,
			'y': parseInt(bytes),
		});
	}
	const config = {
		type: 'scatter',
		data: {
			datasets: datasets,
		},
		options: {
			plugins: {
				legend: {
					display: true,
					labels: {
						color: '#fff',
					}
				}
			},
			scales: {
				x: {
					title: {
						display: true,
						text: 'source code lines',
						color: '#fff',
					},
					ticks: {
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
				y: {
					title: {
						display: true,
						text: 'length of collected resources',
						color: '#fff',
					},
					ticks: {
						callback: (label, index, labels) => (
							Number(label / 1000) + ' KB'
						),
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
			}
		}
	};
	new Chart(document.getElementById('chart'), config);
}

window.addEventListener('load', () => {
	drawChart();
	const cols = [];
	for (const key of columnOrder) {
		const col = document.createElement('div');
		col.textContent = key === 'deprecated' ? '' : key;
		const numeric = key === 'lines';
		col.onclick = () => resort(true, col, key, numeric);
		cols.push(col);
	}
	cols.push(document.createElement('div'));
	document.getElementById('table-head-box').replaceChildren(...cols);
	redraw();
});

