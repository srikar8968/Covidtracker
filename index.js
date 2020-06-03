const axiosCovid = axios.create({
	baseURL: 'https://api.covid19api.com/',
	// transformResponse: [function (data) {
    // 	// sorting data
    // 	if(data.Countries){
    // 		const cvdData = data.Countries.sort(function(a, b){
    // 			return a.TotalConfirmed - b.TotalConfirmed;
    // 		});
    // 		return sc
    // 	}
	//     return data;
  	// }]
});
const tblHeaders = [{
		name: 'Country',
		alias: 'Country',
		type: 'string',
		field: true,
		child: null
	},{
		name: 'TotalConfirmed',
		alias: 'Confirmed',
		type: 'number',
		field: true,
		child: {
			name: 'NewConfirmed',
			alias: 'New Confirmed',
			type: 'number',
			field: false,
			color: 'danger'
		}
	},{
		name: 'Active',
		alias: 'Active',
		type: 'number',
		field: false,
		child: null
	},{
		name: 'TotalRecovered',
		alias: 'Recovered',
		type: 'number',
		field: true,
		child: {
			name: 'NewRecovered',
			alias: 'New Recovered',
			type: 'number',
			field: false,
			color: 'success'
		}
	},{
		name: 'TotalDeaths',
		alias: 'Deceased',
		type: 'number',
		field: true,
		child: {
			name: 'NewDeaths',
			alias: 'New Deceased',
			type: 'number',
			field: false,
			color: 'warning'
		}
	}];
var nodeParent = document.getElementById('covid_tbl_view');
function getResults(){
	nodeParent.innerHTML = '';
	var loader = document.getElementById('loader__ic');
	var errDOM = document.getElementById('err__section');
	loader.style.display = 'block';
	nodeParent.style.display = errDOM.style.display = 'none';
	axiosCovid.get('/summary')
	.then(res => {
		nodeParent.style.display = 'block';
		getUpdatedDate(res.data);
		createGlobalSummary(res.data);
		createDOM(res.data)
	})
	.catch(err => {
		errDOM.style.display = 'block';
	})
	.then(function(){
		loader.style.display = 'none';
	});
}

function createGlobalSummary(res){
	//console.log(res.Date);
	const data = res.Global;
	document.getElementById('stat__total').innerHTML = number_format(data.TotalConfirmed);
	document.getElementById('stat__total__new').innerHTML = '+ ' + number_format(data.NewConfirmed);
	document.getElementById('stat__active').innerHTML = number_format(data.TotalConfirmed - data.TotalRecovered);
	document.getElementById('stat__active__new').innerHTML = '+ ' + number_format(data.NewConfirmed - data.NewRecovered - data.NewDeaths);
	document.getElementById('stat__recovered').innerHTML = number_format(data.TotalRecovered);
	document.getElementById('stat__recovered__new').innerHTML = '+ ' + number_format(data.NewRecovered);
	document.getElementById('stat__deceased').innerHTML = number_format(data.TotalDeaths);
	document.getElementById('stat__deceased__new').innerHTML = '+ ' + number_format(data.NewDeaths)
}

function createDOM(res) {
	// console.log(res);
	let nodeTable = document.createElement('table'); //creating table
	let nodeHeadTg = document.createElement('thead'); //creating thead element
	let nodeBodyTg = document.createElement('tbody'); //creating tbody tag
	let nodeHeadTr = document.createElement('tr'); // creating tr tag
	nodeTable.className = 'cvd__tbl table';
	// Head start
	for(let i in tblHeaders){
		let nodeHeadTd = document.createElement('th');
		let nodeHeadTxt = document.createTextNode(tblHeaders[i].alias);
		nodeHeadTd.className = 'hd__' + tblHeaders[i].name.toLowerCase();
		nodeHeadTd.appendChild(nodeHeadTxt);
		nodeHeadTr.appendChild(nodeHeadTd);
	}
	nodeHeadTg.appendChild(nodeHeadTr);
	nodeTable.appendChild(nodeHeadTg);
	// Body start
	const data = res.Countries;
	var cvdValue;
	for(let key in data){
		let nodeBodyTr = document.createElement('tr');
		nodeBodyTr.setAttribute('data-country', data[key].Slug);
		nodeBodyTr.setAttribute('data-updated', data[key].Date);
		nodeBodyTr.setAttribute('data-code', data[key].CountryCode);
		nodeBodyTr.addEventListener('click', function(){ getByCountry(nodeBodyTr) });
		for(let i in tblHeaders){
			let nodeBodyTd = document.createElement('td');
			if(tblHeaders[i].name === 'Active'){
				cvdValue = number_format(data[key].TotalConfirmed - data[key].TotalRecovered);
				cvdNwVal = number_format(data[key].NewConfirmed - data[key].NewRecovered - data[key].NewDeaths);
				nodeBodyTd.appendChild(addSpanDOM(cvdNwVal, 'primary'));
			}else{
				cvdValue = (tblHeaders[i].type === 'number') ? number_format(data[key][tblHeaders[i].name], 0) : data[key][tblHeaders[i].name];
			}
			if(tblHeaders[i].child){
				nodeBodyTd.appendChild(addSpanDOM(data[key][tblHeaders[i].child.name], tblHeaders[i].child.color));
			}
			let nodeBodyTxt = document.createTextNode(cvdValue);
			nodeBodyTd.className = (key % 2 === 0) ? 'evel' : '';
			nodeBodyTd.style.textAlign = (tblHeaders[i].name === 'Country') ? 'left' : 'right';
			nodeBodyTd.appendChild(nodeBodyTxt);
			nodeBodyTr.appendChild(nodeBodyTd);
		}
		nodeBodyTg.appendChild(nodeBodyTr);
	}

	nodeTable.appendChild(nodeBodyTg);
	nodeParent.appendChild(nodeTable);
}

function getByCountry(node){
	const country = node.getAttribute('data-country');
	const date = node.getAttribute('data-updated');
	const code = node.getAttribute('data-code');
	var content = `Country: "` + country + `"\nCountryCode: "` + code + `"\nLast updated: "` + date + `"`;
	alert(content);
}

function addSpanDOM(val, color){
	let nodeBodySpn = document.createElement('span');
	if(val > 0){
		const spnTxt = '+' + number_format(val, 0);
		let nodeBodyExtTxt = document.createTextNode(spnTxt);
		nodeBodySpn.className = 'text-' + color + ' mr-sm-1 d-sm-inline-block';
		nodeBodySpn.appendChild(nodeBodyExtTxt);
	}
	return nodeBodySpn;
}

function number_format (number, decimals, dec_point, thousands_sep) {
    // Strip all characters but numerical ones.
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

function getUpdatedDate(res){
	var node = document.getElementById('lst_updated');
	const updatedDate = new Date(res.Date);
	node.innerHTML = updatedDate.toGMTString();
}

getResults();

