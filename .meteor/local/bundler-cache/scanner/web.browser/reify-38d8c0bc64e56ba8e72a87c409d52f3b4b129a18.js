module.export({UiKitParserMessage:()=>UiKitParserMessage});let SurfaceRenderer;module.link('../SurfaceRenderer',{SurfaceRenderer(v){SurfaceRenderer=v}},0);var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var UiKitParserMessage = /** @class */ (function (_super) {
    __extends(UiKitParserMessage, _super);
    function UiKitParserMessage() {
        return _super.call(this, ['actions', 'context', 'divider', 'image', 'section', 'preview']) || this;
    }
    return UiKitParserMessage;
}(SurfaceRenderer));

//# sourceMappingURL=UiKitParserMessage.js.map