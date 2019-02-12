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
      modify($, obj);
    }else if(layEvent === 'del'){
      del($, obj.data);
    }else if(layEvent === 'crawl'){
      crawl($, obj.data);
    }
  });
});

//触发查看按钮点击事件
function modify($, obj) {
  layer.open({
    type: 1,
    title: '爬取规则基本信息',
    area: '600px',
    content: $('#modal-rule-detail'),
    btn: ['取消'],
    btn1: function(index, layero){
      layer.close(index);
    },
    success: function(layero, index){
      var _id = layero.find('[name=_id]')
          bookname = layero.find('[name=bookname]'),
          targetUrl = layero.find('[name=targetUrl]'),
          charset = layero.find('[name=charset]'),
          listSign = layero.find('[name=listSign]'),
          sectionNumReg = layero.find('[name=sectionNumReg]'),
          inWhatAtrr = layero.find('[name=inWhatAtrr]'),
          contentSign = layero.find('[name=contentSign]'),
          titleSign = layero.find('[name=titleSign]'),
          mIndex = index;
      _id.val(obj.data._id);
      bookname.val(obj.data.book.name);
      targetUrl.val(obj.data.targetUrl);
      charset.val(obj.data.charset);
      listSign.val(obj.data.listSign);
      sectionNumReg.val(obj.data.sectionNumReg);
      inWhatAtrr.val(obj.data.inWhatAtrr);
      contentSign.val(obj.data.contentSign);
      titleSign.val(obj.data.titleSign);
      $('#btn-rule-modify').on('click', function(){
        layer.confirm('确定要修改？', function(index) {
          var data = {
            _id: _id.val(),
            bookname: bookname.val(),
            targetUrl: targetUrl.val(),
            charset: charset.val(),
            listSign: listSign.val(),
            sectionNumReg: sectionNumReg.val(),
            inWhatAtrr: inWhatAtrr.val(),
            contentSign: contentSign.val(),
            titleSign: titleSign.val()
          }
          $.ajax({
            url:'/admin/book/rule/modify',
            type: 'post',
            data: data,
            beforeSend: function(xhr) {
              layer.load();
            },
            success: function(res) {
              if(res.status == 0){
                layer.closeAll('loading');
                layer.msg(res.msg);
                layer.close(mIndex);
              }else{
                layer.closeAll('loading');
                layer.msg(res.msg);
              }
            },
            error: function(err) {
              layer.msg('修改失败！')
            }
          });
          layer.close(index);
        });
      });
    }
  });
}

//删除按钮触发事件
function del($, data) {
  $.ajax({
    url:'/admin/book/rule/del',
    type: 'post',
    data: data,
    beforeSend: function(xhr){
      layer.load();
    },
    success: function(res){
      console.log(res);
      if(res.status == 0){
        layer.closeAll('loading');
        layer.msg('删除成功！');
        setTimeout(function(){
          location.href = '/admin/book/rule/listPage';
        }, 2000)
      }else{
        console.log(res.msg);
        layer.closeAll('loading');
      }
    },
    error: function(err) {
      console.log('err', err);
      layer.closeAll('loading');
      layer.msg('删除失败！');
    }
  })
}
//爬取按钮触发事件
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
        setTimeout(crawl($, data), 3000);
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
