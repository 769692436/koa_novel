layui.use(['table', 'layedit'], function(){
  var table = layui.table,
      layedit = layui.layedit,
      $ = layui.$;
  var book_id = location.href.split('/').pop();
  console.log(book_id);
  var tableInst = table.render({
    elem: '#section-list',
    url: '/admin/book/section/list/' + book_id,
    page: true,
    skin: 'line',
    toolbar: '#section-list-headBar',
    defaultToolbar: ['print', 'exports'],
    cols: [[
      {type: 'checkbox'},
      {field: '_id', hide: 'true'},
      {field: 'book', title: '小说名称', templet: function(d) {
        return d.book.name
      }},
      {field: 'sectionNum', title: '章节数', sort: 'true'},
      {field: 'title', title: '标题'},
      // {field: 'content', hide: 'true'},
      {field: 'status', hide: 'true'},
      {title: '操作', toolbar: '#section-list-toolbar'}
    ]],
    parseData: function(res) {
      return {
        'code': res.status,
        'msg': res.msg,
        'count': res.count,
        'data': res.data
      }
    }
  });//tableInst end
  //监听头部工具栏事件
  table.on('toolbar(section-list)', function(obj) {
    var checkStatus = table.checkStatus(obj.config.id);
    if(obj.event === 'delAll'){
      var data = checkStatus.data;
      data = data.map(data => data._id);
      delAll($, data);
    }else if(obj.event === 'getMiss'){
      var book = location.href.split('/').pop();
      getMiss($, book);
    }
  });
  //监听工具条事件
  table.on('tool(section-list)', function(obj) {
    var layEvent = obj.event;
    if(layEvent === 'detail') {
      modify($, layedit, obj.data);
    }else if(layEvent === 'del') {
      del($, obj.data);
    }
  });
});

function del($, data) {
  $.ajax({
    url: '/admin/book/section/del',
    type: 'post',
    data: data,
    beforeSend: function(xhr) {
      layer.load();
    },
    success: function(res) {
      layer.msg(res.msg);
      setTimeout(function(){
        location.reload();
      }, 2000)
    },
    error: function(err) {
      layer.msg('删除失败!');
    }
  })
}

function delAll($, data) {
  console.log(data);
  $.ajax({
    url: '/admin/book/section/delAll',
    type: 'post',
    data: {
      _ids: data
    },
    beforeSend: function(xhr) {
      layer.load();
    },
    success: function(res) {
      layer.msg(res.msg);
      setTimeout(function(){
        location.reload();
      },1500);
    },
    error: function(err) {
      console.log(err);
      layer.msg('删除失败!');
      setTimeout(function(){
        location.reload();
      },1500);
    }
  })
}

function modify($, layedit, data) {
  layer.open({
    type: 1,
    title: '第' + data.sectionNum + '章内容',
    area: ['800px', '600px'],
    content: $('#modal-section-detail'),
    btn: ['确认修改', '取消'],
    btn1: function(index, layero) {
      var updateSectionData = {
        _id: data._id,
        title: $('[name=title]').val(),
        content: layedit.getContent(1)
      }
      $.ajax({
        url: '/admin/book/section/modify',
        type: 'post',
        data: updateSectionData,
        beforeSend: function(xhr) {
          layer.load();
        },
        success: function(res) {
          layer.msg(res.msg);
          setTimeout(function(){
            location.reload();
          }, 1500);
        },
        error: function(err) {
          console.log(err);
          layer.msg('修改失败!');
          setTimeout(function(){
            location.reload();
          }, 1500)
        }
      });
    },
    btn2: function(index, layero) {
      layer.close(index);
    },
    success: function(layero, index) {
      var editIndex = layedit.build('content-edit');
      var title = layero.find('[name=title]'),
          content = layero.find('[name=content]');
      title.val(data.title);
      layedit.setContent(editIndex, data.content);
    }
  });
}

function getMiss($, book) {
  $.ajax({
    url: '/admin/book/section/getMiss',
    type: 'post',
    data: {
      book: book
    },
    beforeSend: function(xhr) {
      layer.load();
    },
    success: function(res) {
      layer.closeAll('loading');
      console.log(res.list);
      layer.open({
        type: 0,
        title: '缺失的章节',
        content: res.list.toString(),
        btn: '关闭',
        btnAlign: 'c'
      });
    },
    error: function(err) {
      console.log(err);
      layer.msg('查询失败!');
    }
  })
}
