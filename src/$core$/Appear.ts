//
export const observeAttributeBySelector = (element, selector, attribute, cb) => {
    const attributeList = new Set<string>((attribute.split(",") || [attribute]).map((s) => s.trim()));
    const observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type == "childList") {
                const addedNodes = Array.from(mutation.addedNodes) || [];
                const removedNodes = Array.from(mutation.removedNodes) || [];

                //
                addedNodes.push(...Array.from(mutation.addedNodes || []).flatMap((el)=>{
                    return Array.from((el as HTMLElement)?.querySelectorAll?.(selector) || []) as Element[];
                }));

                //
                removedNodes.push(...Array.from(mutation.removedNodes || []).flatMap((el)=>{
                    return Array.from((el as HTMLElement)?.querySelectorAll?.(selector) || []) as Element[];
                }));

                //
                [...Array.from((new Set(addedNodes)).values())].filter((el) => (<HTMLElement>el)?.matches?.(selector)).forEach((target)=>{
                    attributeList.forEach((attribute)=>{
                        cb({ target, type: "attributes", attributeName: attribute, oldValue: (target as HTMLElement)?.getAttribute?.(attribute) }, observer);
                    });
                });
            } else
            if ((mutation.target as HTMLElement)?.matches?.(selector) && (mutation.attributeName && attributeList.has(mutation.attributeName))) {
                cb(mutation, observer);
            }
        }
    });

    //
    observer.observe(element, {
        attributeOldValue: true,
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [...attributeList],
        characterData: true
    });

    //
    Array.from(element.querySelectorAll(selector)).forEach((target)=>{
        attributeList.forEach((attribute)=>{
            cb({ target, type: "attributes", attributeName: attribute, oldValue: (target as HTMLElement)?.getAttribute?.(attribute) }, observer);
        });
    });

    //
    return observer;
};

//
const computed = Symbol("@computed");
const animateHide = async (target)=>{
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && !target.classList.contains("u2-while-animation") && !target.hasAttribute("data-instant")) {
        target.classList.add("u2-while-animation");
    }

    //
    if (target.classList.contains("u2-while-animation")) {
        //target[computed] = getComputedStyle(target, "");
        await target.animate([
            {
                easing: "linear",
                offset: 0,

                //
                display: target[computed]?.display || "revert-layer",
                "--opacity": target[computed]?.getPropertyValue("--opacity") || "revert-layer",
                "--scale": target[computed]?.getPropertyValue("--scale") || "revert-layer",
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 0.99,

                //
                display: target[computed]?.display || "revert-layer",
                "--opacity": 0,
                "--scale": 0.8,
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 1,

                //
                display: "none",
                "--opacity": 0,
                "--scale": 0.8,
                pointerEvents: "none"
            }
        ],  {
            fill: "none",
            duration: 100,
            easing: "linear",
            delay: matchMedia("(hover: none)").matches ? (parseFloat(target.getAttribute("data-delay-hide") || "0") || 0) : 0
            //rangeStart: "cover 0%",
            //rangeEnd: "cover 100%",
        }).finished;

        //
        target.classList.remove("u2-while-animation");
    }

    //
    target.dispatchEvent(new CustomEvent("u2-hidden", {
        detail: {},
        bubbles: true,
        cancelable: true
    }));
}

//
const animateShow = async (target)=>{
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
                display: "none",
                "--opacity": 0,
                "--scale": 0.8,
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 0.01,

                //
                display: target[computed]?.display || "revert-layer",
                "--opacity": 0,
                "--scale": 0.8,
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 1,

                //
                display: target[computed]?.display || "revert-layer",
                "--opacity": target[computed]?.getPropertyValue("--opacity") || "revert-layer",
                "--scale": target[computed]?.getPropertyValue("--scale") || "revert-layer",
                pointerEvents: target[computed]?.pointerEvents || "revert-layer"
            }
        ], {
            fill: "none",
            duration: 100,
            easing: "linear",
            delay: 0
            //rangeStart: "cover 0%",
            //rangeEnd: "cover 100%",
        }).finished;

        //
        target.classList.remove("u2-while-animation");
    }

    //
    target.dispatchEvent(new CustomEvent("u2-appear", {
        detail: {},
        bubbles: true,
        cancelable: true
    }));
}

// @ts-ignore
import styles from "../$scss$/_States.scss?inline";

//
const loadInlineStyle = (inline: string)=>{
    const style = document.createElement("style");
    style.dataset.owner = "existence";
    //style.innerHTML = inline;
    style.innerHTML = `@import url("${URL.createObjectURL(new Blob([inline], {type: "text/css"}))}");`;
    document.head.appendChild(style);
}

//
const loadBlobStyle = (inline: string)=>{
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.type = "text/css";
    style.dataset.owner = "existence";
    style.href = URL.createObjectURL(new Blob([inline], {type: "text/css"}));
    document.head.appendChild(style);
    return style;
}

//
const initialize = ()=>{
    loadBlobStyle(styles);

    //
    observeAttributeBySelector(document.body, "*[data-hidden]", "data-hidden", (mutation)=>{
        if (mutation.attributeName == 'data-hidden') {
            const target = mutation.target as HTMLElement;
            if (target.dataset.hidden != mutation.oldValue) {
                if ((target.dataset.hidden && target.dataset.hidden != "false")) {
                    animateHide(target);
                } else {
                    animateShow(target);
                }
            }
        }
    });
}

export default initialize;
