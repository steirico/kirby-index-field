<?php

require_once __DIR__ . DS . 'options.php';

class IndexField extends BaseField {

  static public $assets = [
    'css' => [
      'datatables.min.css',
      'main.css'
    ],
    'js' => [
      'datatables.min.js',
      'main.js'
    ]
  ];

  public function __construct () {
    $this->rows = 10;
    $this->order = 'asc';
    $this->type = 'index';
    $this->options = [];
    $this->icon = false;
  }

  public function routes () {
    return array(
      array(
        'pattern' => 'list',
        'method'  => 'get',
        'action'  => 'list_entries'
      )
    );
  }

  public function initOrder(){
    $sortCloumn = 0;

    if(!empty($this->columnOptions) && !empty($this->columnOptions['icon']) && $this->columnOptions['icon']){
      $sortCloumn = 1;
    }

    return '[ ' . $sortCloumn . ', "' . $this->order . '" ]';
  }

  public function subpagelinks ($pageAdd, $pageEdit) {
    if(!$pageAdd && ! $pageEdit) return '';

    $pageAdd = $pageAdd ? '' : 'style="display: none;"';
    $pageEdit = $pageEdit ? '' : 'style="display: none;"';
    
    if (in_array($this->options, ['children', 'visibleChildren', 'invisibleChildren'])) {
      $hrefEdit = $this->page->url('subpages');
      $hrefAdd = $this->page->url('add');
      $addAttribute = 'data-modal="true"';
    } else if (in_array($this->options, ['files', 'images', 'documents', 'videos', 'audio', 'code', 'archives'])) {
      $hrefEdit = $this->page->url('files');
      $hrefAdd = '#upload';
      $addAttribute = 'data-upload';
    } else if (in_array($this->options, ['query']) && array_key_exists('fetch', $this->query) && in_array($this->query['fetch'], ['children', 'visibleChildren', 'invisibleChildren'])) {
      if (array_key_exists('page', $this->query)) {
        $options = new Kirby\Panel\Form\IndexFieldOptions($this);
        $page = $options->activePage();
      } else {
        $page = $this->page;
      }

      if($page){
        $hrefEdit = $page->url('subpages');
        $hrefAdd = $page->url('add');
        $addAttribute = 'data-modal="true"';
      } else {
        $addAttribute = 0;
      }
      
    } else {
      $addAttribute = 0;
    }

    if (is_string($addAttribute)) {
      return <<<HTML
        <span class="hgroup-options shiv shiv-dark shiv-left">
          <span class="hgroup-option-right">
            <a href="{$hrefEdit}" title="Edit" {$pageEdit}>
              <i class="icon icon-left fa fa-pencil"></i><span>Edit</span>
            </a>
            <a href="{$hrefAdd}" title="+" shortcut="+" {$addAttribute}  {$pageAdd}>
              <i class="icon icon-left fa fa-plus-circle"></i><span>Add</span>
            </a>
          </span>
        </span>
HTML;
    }
  }

  public function label () {
    if (!$this->label) return null;

    $pageAdd = (isset($this->pageadd) && !$this->pageadd) ? $this->pageadd : true;
    $pageEdit = (isset($this->pageedit) && !$this->pageedit) ? $this->pageedit : true;

    if (isset($this->addedit) && !$this->addedit) {
      $pageAdd = false;
      $pageEdit = false;
    }

    $subpagelinks = $this->subpagelinks($pageAdd, $pageEdit);

    return <<<HTML
      <label class="label" for="{$this->id()}">
        <h2 class="hgroup hgroup-single-line hgroup-compressed cf">
          <span class="hgroup-title">{$this->i18n($this->label)}</span>
          {$subpagelinks}
        </h2>
      </label>
HTML;
  }

  private function iconColumn($id) {
    return array(
      $id => array(
        'label' => '',
        'width' => 18,
        'sort' => false,
        'class' => 'index-fields-action',
      )
    );
  }

  public function columns () {
    if(empty($this->columns)){
      return [ 'title' => 'Title' ];
    } else if(!empty($this->columnOptions)) {
      $options = $this->columnOptions;
      $columns = array();

      if(!empty($options['icon']) && $options['icon']){
        $columns = array_merge($columns, $this->iconColumn('icon'));
      }

      $columns = array_merge($columns, $this->columns);

      if(!empty($options['actions'])){
        foreach($options['actions'] as $action){
          $columns = array_merge($columns, $this->iconColumn($action));
        }
      }

      return $columns;
    } else {
      return $this->columns;
    }
  }

  public function content () {
    return tpl::load(__DIR__ . DS . 'template.php', array('field' => $this));
  }

  public function url ($action) {
    return purl($this->model(), 'field/' . $this->name() . '/index/' . $action);
  }

  public function validate () {
    return true;
  }

}