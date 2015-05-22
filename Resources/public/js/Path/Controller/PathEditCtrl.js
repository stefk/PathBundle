/**
 * Class constructor
 * @returns {PathEditCtrl}
 * @constructor
 */
var PathEditCtrl = function PathEditCtrl($route, PathService, HistoryService, ClipboardService, $scope) {
    // Call parent constructor
    PathBaseCtrl.apply(this, arguments);

    this.historyService   = HistoryService;
    this.clipboardService = ClipboardService;

    this.historyDisabled = HistoryService.getDisabled();

    $scope.$watch(
        function () {
            return this.path;
        }.bind(this),
        function (newValue) {
            var empty   = this.historyService.isEmpty();
            var updated = this.historyService.update(newValue);

            if (!empty && updated) {
                // Initialization is already done, so mark path as unsaved for each modification
                this.unsaved = true;
            }
        }.bind(this)
    , true);

    return this;
};

// Extends the base controller
PathEditCtrl.prototype = PathBaseCtrl.prototype;
PathEditCtrl.prototype.constructor = PathEditCtrl;

/**
 * Is Path is modified since the last publishing
 * @type {boolean}
 */
PathEditCtrl.prototype.modified  = false;

/**
 * Is Path published or not
 * @type {boolean}
 */
PathEditCtrl.prototype.published = false;

/**
 * Do Path have pending modifications
 * @type {boolean}
 */
PathEditCtrl.prototype.unsaved   = false;

/**
 * Current state of the history stack
 * @type {object}
 */
PathEditCtrl.prototype.historyDisabled = {};

/**
 * Undo last action
 */
PathEditCtrl.prototype.undo = function () {
    if (this.historyService.canUndo()) {
        // Inject history data
        this.historyService.undo(this.path);
    }
};

/**
 * Redo last action
 */
PathEditCtrl.prototype.redo = function () {
    if (this.historyService.canRedo()) {
        // Inject history data
        this.historyService.redo(this.path);
    }
};

/**
 * Save the path
 */
PathEditCtrl.prototype.save = function () {
    this.pathService.save().then(function () {
        // Mark path as modified
        this.modified = true;
        this.unsaved  = false;
    }.bind(this));
};

/**
 * Publish the path modifications
 */
PathEditCtrl.prototype.publish = function () {
    this.pathService.publish().then(function () {
        this.modified  = false;
        this.published = true;
        this.unsaved   = false;
    }.bind(this));
};

/**
 * Preview path into player
 */
PathEditCtrl.prototype.preview = function () {
    if (this.published) {
        // Path needs to be published at least once to be previewed

        var url = Routing.generate('innova_path_player_wizard', {
            id: this.id
        });

        if (this.modified || this.unsaved) {
            // Path modified => modifications will not be visible before publishing so warn user
            this.confirmService.open(
                // Confirm options
                {
                    title:         Translator.trans('preview_with_pending_changes_title',   {}, 'path_wizards'),
                    message:       Translator.trans('preview_with_pending_changes_message', {}, 'path_wizards'),
                    confirmButton: Translator.trans('preview_with_pending_changes_button',  {}, 'path_wizards')
                },

                // Confirm success callback
                function () {
                    window.open(url, '_blank');
                }
            );
        } else {
            // Open player to preview the path
            window.open(url, '_blank');
        }
    }
};