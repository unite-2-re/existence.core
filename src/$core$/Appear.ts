// @ts-ignore
import {observeAttributeBySelector, loadBlobStyle} from "/externals/lib/dom.js";

// @ts-ignore
//import {loadBlobStyle} from "/externals/core/agate.js";

//
const computed = Symbol("@computed");
const animateHide = async (target)=>{
    //
    if (target?.dispatchEvent?.(new CustomEvent("u2-before-hide", {
        detail: {},
        bubbles: true,
        cancelable: true
    }))) {
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches && !target.classList.contains("u2-while-animation") && !target.hasAttribute("data-instant")) {
            target.classList.add("u2-while-animation");
        }

        //
        if (target.classList.contains("u2-while-animation")) {
            target[computed] = getComputedStyle(target, "");
            await target.animate([
                {
                    easing: "linear",
                    offset: 0,

                    //
                    "--opacity": target[computed]?.getPropertyValue("--opacity") || target[computed]?.getPropertyValue("opacity") || "revert-layer",
                    "--scale": target[computed]?.getPropertyValue("--scale") || 1,
                    display: target[computed]?.display || "revert-layer",
                    pointerEvents: "none"
                },
                {
                    easing: "linear",
                    offset: 0.99,

                    //
                    "--opacity": 0,
                    "--scale": 0.8,
                    display: target[computed]?.display || "revert-layer",
                    pointerEvents: "none"
                },
                {
                    easing: "linear",
                    offset: 1,

                    //
                    "--opacity": 0,
                    "--scale": 0.8,
                    display: "none",
                    pointerEvents: "none"
                }
            ],  {
                //fill: "forwards",
                duration: 80,
                easing: "linear",
                delay: 0
                //rangeStart: "cover 0%",
                //rangeEnd: "cover 100%",
            }).finished;

            //
            target.classList.remove("u2-while-animation");
        }
    }

    //
    target?.dispatchEvent?.(new CustomEvent("u2-hidden", {
        detail: {},
        bubbles: true,
        cancelable: true
    }));
}

//
const animateShow = async (target)=>{
    //
    if (target?.dispatchEvent?.(new CustomEvent("u2-before-show", {
        detail: {},
        bubbles: true,
        cancelable: true
    }))) {
        //
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches && !target.classList.contains("u2-while-animation") && !target.hasAttribute("data-instant")) {
            target.classList.add("u2-while-animation");
        }

        //
        if (target.classList.contains("u2-while-animation")) {
            await target.animate([
                {
                    easing: "linear",
                    offset: 0,

                    //
                    "--opacity": 0,
                    "--scale": 0.8,
                    display: "none",
                    pointerEvents: "none"
                },
                {
                    easing: "linear",
                    offset: 0.01,

                    //
                    "--opacity": 0,
                    "--scale": 0.8,
                    display: target[computed]?.display || "revert-layer",
                    pointerEvents: "none"
                },
                {
                    easing: "linear",
                    offset: 1,

                    //
                    "--opacity": target[computed]?.getPropertyValue("--opacity") || target[computed]?.getPropertyValue("opacity") || 1,
                    "--scale": target[computed]?.getPropertyValue("--scale") || 1,
                    display: target[computed]?.display || "revert-layer",
                    pointerEvents: target[computed]?.pointerEvents || "revert-layer"
                }
            ], {
                //fill: "forwards",
                duration: 80,
                easing: "linear",
                delay: 0
                //rangeStart: "cover 0%",
                //rangeEnd: "cover 100%",
            }).finished;

            //
            target.classList.remove("u2-while-animation");
        }
    }

    //
    target?.dispatchEvent?.(new CustomEvent("u2-appear", {
        detail: {},
        bubbles: true,
        cancelable: true
    }));
}

// @ts-ignore
import styles from "../$scss$/_States.scss?inline&compress";

//
const initialize = ()=>{
    loadBlobStyle(styles);
    observeAttributeBySelector(document.body, "*", "data-hidden", (mutation)=>{
        if (mutation.attributeName == 'data-hidden') {
            const target = mutation.target as HTMLElement;
            if ( // TODO: legacy "false" support
                (target.dataset.hidden == null && mutation.oldValue != null) || 
                (target.dataset.hidden != null && mutation.oldValue == null)
            ) {
                if (target.dataset.hidden != null) {
                    animateHide(target);
                } else {
                    animateShow(target);
                }
            }
        }
    });
}

//
export default initialize;
