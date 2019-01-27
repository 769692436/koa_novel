layui.use('table', function(){
  var table = layui.table;
  var $ = layui.$;
  table.render({
    elem: '#rule-list',
    url: '/admin/book/rule/list',
    page: true,
    skin: 'line',
    cols: [[
      {type: 'checkbox'},
      {field: '_id', hide: 'true'},
      {field: 'book', title: '小说名称', templet: function(d){
        return d.book.name;
      }},
      {field: 'targetUrl', title: '目标地址'},
      {title: '操作', toolbar: '#rule-list-toolbar'}
    ]],
    parseData: function(res) {
      return {
        'code': res.status,
        'msg': res.msg,
        'count': res.count,
        'data': res.data
      }
    }
  });
  //监听工具条
  table.on('tool(rule-list)', function(obj) {
    var layEvent = obj.event;
    if(layEvent === 'detail'){

    }else if(layEvent === 'edit'){

    }else if(layEvent === 'del'){

    }else if(layEvent === 'crawl'){
      crawl($, obj.data);
    }
  });
});

function crawl($, data){
  $.ajax({
    url: '/admin/book/rule/crawl',
    type: 'post',
    data: data,
    beforeSend: function(xhr){
      layer.load();
    },
    success: function(res){
      if(res.status == 0){
        var msgList = res.data.sort(function(a, b){
          return a.sectionNum - b.sectionNum;
        });
        console.log(msgList[msgList.length - 1].sectionNum);
        layer.closeAll('loading');
        layer.msg('已更新到第' + msgList[msgList.length - 1].sectionNum + '章！', {offset: '100px'});
        crawl($, data);
      }else{
        console.log(res.msg);
        layer.closeAll('loading');
      }
    },
    error: function(err) {
      if(err){
        layer.closeAll('loading');
        layer.msg('爬取失败！');
      }
    }
  });
}
