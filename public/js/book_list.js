layui.use('table', function(){
  var table = layui.table;
  table.render({
    elem: '#book-list',
    url: '/admin/book/list',
    page: true,
    skin: 'line',
    cols: [[
      {type: 'checkbox'},
      {field: 'bookId', title: 'ID', width: 50},
      {field: 'name', title: '书名'},
      {field: 'author', title: '作者', width: 100},
      {field: 'state', title: '连载状态'},
      {field: 'currentLength', title: '最新章节数'},
      {title: '操作', toolbar: '#book-list-toolbar'}
    ]],
    parseData: function(res) {
      return {
        'code': res.status,
        'message': res.msg,
        'count': res.count,
        'data': res.data
      }
    }
  });
});
