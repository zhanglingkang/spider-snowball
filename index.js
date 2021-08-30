// @ts-nocheck

function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

function extract(table, name) {
  let result = [];
  table.querySelectorAll('tr').forEach(tr => {
    let firstTd = tr.querySelector('td,th');
    if (firstTd && firstTd.innerText.trim() === name) {
      let tds = tr.querySelectorAll('td,th');
      for (let i = 1; i < tds.length; ++i) {
        result.push(tds[i].innerText.replace(/亿/g, ''));
      }
    }
  });
  return result;
}

function download(csvString) {
  var fileName = 'Result';
  var uri = 'data:application/csv;charset=utf-8,' + csvString;
  var link = document.createElement('a');
  link.href = uri;
  link.style = 'visibility:hidden';
  link.download = fileName + '.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

(function ($) {
  $.fn.table2csv = function (option) {
    if (option == null) option = {};
    if (option.repeatChar == '') option.repeatChar = '-';
    //计算行数列数
    var rows = 0; //行
    var cols = 0; //列
    this.find('tr').each(function () {
      rows += 1;
      var tr = $(this);
      var n = tr.find('td,th').length;
      cols = Math.max(cols, n);
    });
    //document.title=("行/列："+rows+"/"+cols);
    //空数组准备
    var data = new Array();
    for (var i = 0; i < rows; i++) {
      var line = new Array();
      for (var j = 0; j < cols; j++) line.push('');
      data.push(line);
    }
    //数据填充
    var i = 0; //当前行坐标
    this.find('tr').each(function () {
      var tr = $(this);
      var j = 0; //当前列坐标
      tr.find('td,th').each(function () {
        var td = $(this);
        var colspan = 1;
        var rowspan = 1;
        var value = this.innerText
          .replace(/亿|元|天|次/g, '')
          .replace(/一季度|一季报/, 'Q1')
          .replace(/二季度|中报/, 'Q2')
          .replace(/三季度|三季报/, 'Q3')
          .replace(/四季度|年报/, 'Q4');
        // if (td.attr('colspan') != null) colspan = parseInt(td.attr('colspan'));
        // if (td.attr('rowspan') != null) rowspan = parseInt(td.attr('rowspan'));
        //定位CSV数组中第一个没有数据的单元格
        for (var p = 0; p < data[i].length; p++) {
          if (data[i][p] == '') {
            j = p;
            break;
          }
        }
        data[i][j] = value; //填充值
        //填充单元格区域
        var fic = i + rowspan; //alert(value+i+":"+j);
        for (var fi = i; fi < fic; fi++) {
          var fjc = j + colspan; //alert(""+j+"\r\n"+fic+":"+fjc);
          for (var fj = j; fj < fjc; fj++) {
            if (fj == j && fi == i) continue;
            data[fi][fj] = option.repeatChar == null ? value : option.repeatChar; //alert(test(data));
          }
        }
      });
      i++;
    });
    //填充完毕
    //生成调试数据
    var str = '';
    for (var i in data) {
      str += data[i].join(',');
      str += '\r\n';
    }
    if (option.callback != null) option.callback(str, data);
  };

  $.fn.csv2table = function (param) {
    var isarray = param instanceof Array;
    var data = null;
    if (isarray)
      //数组直接用
      data = param;
    else {
      //csv字符串则转为数组
      data = new Array();
      var lines = param.split('\r\n');
      for (var i = 0; i < lines.length; i++) {
        var cells = lines[i].split(',');
        data.push(cells);
      }
    }
    var table = "<table border='1'>";
    for (var i = 0; i < data.length; i++) {
      table += '<tr>';
      var cells = data[i];
      for (var j = 0; j < cells.length; j++) table += '<td>' + cells[j] + '</td>';
      table += '</tr>';
    }
    table += '</table>';
    table += isarray ? '<!--数组-->' : '<!--字串-->';
    this.html(table);
  };
})(jQuery);

async function extractAll() {
  let newTable;
  for (let i = 0; i < 10; i++) {
    let table = document.querySelector('.stock__info__main table');
    if (i === 0) {
      newTable = $(table.outerHTML);
      $(document.body).append(newTable);
    } else {
      table.querySelectorAll('thead tr').forEach(tr => {
        let tds = tr.querySelectorAll('td,th');
        for (let i = 2; i < tds.length; ++i) {
          let text = tds[i].innerText.replace(/亿/g, '');
          newTable[0].querySelector('thead tr').append($(`<th>${text}</th>`)[0]);
        }
      });
      table.querySelectorAll('tbody tr').forEach((tr, index) => {
        let tds = tr.querySelectorAll('td,th');
        let newTr = newTable[0].querySelector(`tbody tr:nth-child(${index + 1})`);
        for (let i = 2; i < tds.length; ++i) {
          let text = tds[i].innerText;
          newTr.append($(`<td>${text}</td>`)[0]);
        }
      });
    }
    document
      .querySelector('.stock__info__main .stock-info-title .table-operate span:nth-child(2)')
      .click();
    await wait(1000);
  }
  return newTable;
}

function array2csv(tableArr) {
  return tableArr.map(row => row.join(',')).join('\n');
}

function rowColumnTransfer(arr) {
  return arr[0].map(function (col, i) {
    return arr.map(function (row) {
      return row[i];
    });
  });
}

const includeList = [
  '报告期',
  '营业收入',
  '营业收入同比增长',
  '净利润',
  '净利润同比增长',
  '扣非净利润',
  '扣非净利润同比增长',
  '每股收益',
  '每股净资产',
  '每股经营现金流',
  '净资产收益率',
  '净资产收益率-摊薄',
  '总资产报酬率',
  '人力投入回报率',
  '销售毛利率',
  '销售净利率',
  '资产负债率',
  '权益乘数',
  '存货周转数',
  '应收账款周转数',
  '应付账款周转数',
  '销售费用',
  '管理费用',
  '研发费用',
  '财务费用',
  '投资收益',
  '经营活动现金流入小计',
  '经营活动现金流出小计',
  '经营活动产生的现金流量净额',
  '投资活动现金流入小计',
  '投资活动现金流出小计',
  '投资活动产生的现金流量净额',
  '筹资活动现金流入小计',
  '筹资活动现金流出小计',
  '筹资活动产生的现金流量净额',
  '其中：营业成本'
];

function ascByTime(tableArr) {
  return [tableArr[0], ...tableArr.slice(1).reverse()];
}
$(await extractAll()).table2csv({
  callback(str, data) {
    let filter = row => includeList.some(name => name === row[0]);
    let finalData = ascByTime(rowColumnTransfer(data.filter(filter)));
    console.log(finalData);
    download(array2csv(finalData));
  }
});
