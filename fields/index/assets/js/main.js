(function($) {

  var Indexfield = function (el) {

    var element = $(el);
    var table = element.find('table')
    var columns = table.data('indexfield-columns');
    var entriesapi = table.data('indexfield-entries');
    var rows = table.data('indexfield-rows');
    var order = table.data('indexfield-order');

    var headers = Object.keys(columns).map(function (key) {
      if ($.isPlainObject(columns[key])) {
        return $('<th>' + columns[key].label + '</th>')
      } else {
        return $('<th>' + columns[key] + '</th>')
      }
    });


    table.append(tableHead(headers, $('<thead></thead>')))
    table.append(tableHead(headers, $('<tfoot></tfoot>')))

    var defs = columnDefs(columns)
    
    var table = table.DataTable({
      columnDefs: defs,
      pageLength: rows,
      order: [order],
      ajax: {
        url: entriesapi,
        dataSrc: function (json) {
          var formatted = Object.keys(json).map(function (k) {
            var i = json[k]
            var result = []
            
            Object.keys(columns).forEach(function (key) {

              switch(key){
                case 'icon':
                  result.push(blueprintIcon(i.icon, i.template));
                  break;

                case 'edit':
                  result.push(editButton(i.panelurl));
                  break;

                case 'toggle':
                  result.push(toggleButton(i.toggleurl, i.togglevisable,  i.togglestate));
                  break;

                case 'delete':
                  result.push(deleteButton(i.deleteurl, i.deletestate));
                  break;

                default:
                  /**
                   * 1. Check for key under content object (page fields)
                   * 2. Check for key under meta object (file fields)
                   * 3. Use name as fallback for title on files
                   * 4. Check for key under top level object
                   * 5. Return empty string if no value
                   */

                  var item = i.content && i.content[key]
                    ? i.content[key]
                    : i.meta && i.meta[key]
                    ? i.meta[key]
                    : key === 'title' && !i.title && i.name
                    ? i.name
                    : i[key]
                    ? i[key]
                    : ''

                  result.push(item);
              }
            })

            return result;
          })

          return formatted
        }
      }
    });

    // click row to edit
    table.on('click', 'tbody tr', function (e) {
      var $target = $(e.target)
      if (!$target.is('i') && !$target.is('a') && !$target.hasClass('index-fields-action')) {
        var $edit = $(e.currentTarget).find('.structure-edit-button')
        if ($edit.length) $edit.get(0).click()
      }
    })

    function blueprintIcon (icon, template) {
      return ' \
          <i class="icon fa fa-' + icon + '" title="Template: ' + template + '"></i> \
      '
    }

    function editButton (editurl) {
      return ' \
        <a class="btn structure-edit-button" href="' + editurl + '"> \
          <i class="icon fa fa-pencil" title="Click to edit"></i> \
        </a> \
      '
    }

    function toggleButton (toggleurl, visible, state) {
      return ' \
        <a class="btn structure-toggle-button' + (visible ? '' : ' is-disabled') + '" href="' + toggleurl + '" data-modal="true"> \
          <i class="icon fa fa-toggle-' + (state ? 'off' : 'on') + '" title="Status: ' + (state ? 'Invisible' : 'Visible') + '. Click to change."></i> \
        </a> \
      '
    }

    function deleteButton (deleteurl, visible) {
      return ' \
        <a class="btn structure-delete-button' + (visible ? '' : ' is-disabled') + '" href="' + deleteurl + '" data-modal="true"> \
          <i class="icon fa fa-trash-o" title="Clieck to delete"></i> \
        </a> \
      '
    }

    function tableHead (headers, $element) {
      var $row = $('<tr></tr>')
      headers.forEach(function ($header) {
        $row.append($header.clone())
      })

      return $element.append($row);
    }

    function columnDefs () {
      // column defs handle custom column widths and classnames
      var colCount = Object.keys(columns).length
    
      var defs = [];

      Object.keys(columns).forEach(function (key, i) {
        if (columns[key].width) {
          defs.push({
            width: columns[key].width,
            targets: i
          })
        }
        if (columns[key].class) {
          defs.push({
            className: columns[key].class,
            targets: i
          })
        }
        if ($.isPlainObject(columns[key]) && columns[key].hasOwnProperty('visible')) {
          defs.push({
            visible: columns[key].visible,
            targets: i
          })
        }
        if ($.isPlainObject(columns[key]) && columns[key].hasOwnProperty('sort')) {
          defs.push({
            orderable: columns[key].sort,
            targets: i
          })
        }
      })

      return defs
    }

  };

  $.fn.indexfield = function () {

    return this.each(function () {

      if ($(this).data('indexfield')) {
        return $(this);
      } else {
        var indexfield = new Indexfield(this);
        $(this).data('indexfield', indexfield);
        return $(this);
      }

    });

  };

})(jQuery);