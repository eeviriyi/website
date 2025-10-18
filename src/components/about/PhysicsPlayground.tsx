"use client";

import type { Body, Mouse, MouseConstraint } from "matter-js";
import Matter from "matter-js";
import { useEffect, useMemo, useRef } from "react";

const CANVAS_HEIGHT = 360;
const WALL_THICKNESS = 40;
const POINTER_FORCE_RADIUS = 240;
const POINTER_FORCE = 0.008;
const CLICK_FORCE = 0.16;

type ImageShape = "circle" | "rectangle" | "triangle";

type TextureSource =
    | {
        kind: "image";
        src: string;
        width: number;
        height: number;
        restitution: number;
        shape?: ImageShape;
    }
    | {
        kind: "shape";
        shape: ImageShape;
        width: number;
        height: number;
        background: string;
        restitution: number;
    }
    | {
        kind: "text";
        label: string;
        width: number;
        height: number;
        background: string;
        color: string;
        restitution: number;
    };

const textureSources: TextureSource[] = [
    { height: 128, kind: "image", restitution: 0.7, shape: "circle", src: "/images/avatar.png", width: 128 },
    { height: 128, kind: "image", restitution: 0.7, shape: "circle", src: "/images/nextjs_logo_pic.png", width: 128 },
    { height: 96, kind: "image", restitution: 0.7, shape: "circle", src: "/images/bun_logo.svg", width: 96 },
    { height: 96, kind: "image", restitution: 0.7, shape: "rectangle", src: "/images/drizzle_orm_pic.png", width: 96 },
    { height: 144, kind: "image", restitution: 0.5, shape: "rectangle", src: "/images/nextjs_logo_text.png", width: 224 },
    { background: "#2f74c0", color: "#f7f7f7", height: 128, kind: "text", label: "TS", restitution: 0.7, width: 128 },
    { background: "#e8d44d", color: "#30312e", height: 96, kind: "text", label: "JS", restitution: 0.9, width: 96 },
];

type Drawable =
    | {
        kind: "image";
        body: Body;
        image: HTMLImageElement;
        width: number;
        height: number;
    }
    | {
        kind: "shape";
        body: Body;
        width: number;
        height: number;
        background: string;
        shape: ImageShape;
    }
    | {
        kind: "text";
        body: Body;
        canvas: HTMLCanvasElement;
        width: number;
        height: number;
    };

function createTextCanvas({
    label,
    width,
    height,
    background,
    color,
}: {
    label: string;
    width: number;
    height: number;
    background: string;
    color: string;
}) {
    const canvas = document.createElement("canvas");
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    const context = canvas.getContext("2d");
    if (!context) {
        return canvas;
    }

    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.font = `700 ${Math.round(height * 0.5)}px 'Noto Sans SC', 'Inter', sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.fillText(label, width / 2, height / 2 + height * 0.02);

    return canvas;
}

export function PhysicsPlayground() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const drawablesRef = useRef<Drawable[]>([]);

    const options = useMemo(
        () => ({
            density: 0.0012,
            friction: 0.03,
            frictionAir: 0.01,
        }),
        [],
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = CANVAS_HEIGHT;

        const engine = Matter.Engine.create();
        engine.gravity.y = 1.2;

        const render = Matter.Render.create({
            element: container,
            engine,
            options: {
                background: "transparent",
                height,
                pixelRatio: window.devicePixelRatio ?? 1,
                width,
                wireframes: false,
            },
        });

        const runner = Matter.Runner.create();

        const world = engine.world;
        const bodies: Body[] = [];
        const drawables: Drawable[] = [];

        const floor = Matter.Bodies.rectangle(width / 2, height + WALL_THICKNESS / 2, width, WALL_THICKNESS, {
            isStatic: true,
            render: { fillStyle: "#111827" },
        });

        const ceiling = Matter.Bodies.rectangle(width / 2, -WALL_THICKNESS / 2, width, WALL_THICKNESS, {
            isStatic: true,
            render: { fillStyle: "#111827" },
        });

        const leftWall = Matter.Bodies.rectangle(-WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height, {
            isStatic: true,
            render: { fillStyle: "transparent" },
        });

        const rightWall = Matter.Bodies.rectangle(width + WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height, {
            isStatic: true,
            render: { fillStyle: "transparent" },
        });

        Matter.World.add(world, [floor, ceiling, leftWall, rightWall]);

        textureSources.forEach((item, index) => {
            const x = width * 0.2 + Math.random() * width * 0.6;
            const y = 60 + Math.random() * 40 - index * 10;

            if (item.kind === "image") {
                const shape = item.shape ?? "circle";
                const commonRender = {
                    fillStyle: "transparent",
                    strokeStyle: "transparent",
                };

                let body: Body;

                if (shape === "rectangle") {
                    body = Matter.Bodies.rectangle(x, y, item.width, item.height, {
                        restitution: item.restitution,
                        ...options,
                        render: commonRender,
                    });
                } else if (shape === "triangle") {
                    body = Matter.Bodies.polygon(x, y, 3, 1, {
                        restitution: item.restitution,
                        ...options,
                        render: commonRender,
                    });

                    const currentWidth = body.bounds.max.x - body.bounds.min.x;
                    const currentHeight = body.bounds.max.y - body.bounds.min.y;
                    const scaleX = item.width / currentWidth;
                    const scaleY = item.height / currentHeight;
                    Matter.Body.scale(body, scaleX, scaleY);
                    Matter.Body.setAngle(body, -Math.PI / 2);
                } else {
                    const radius = Math.max(item.width, item.height) / 2;
                    body = Matter.Bodies.circle(x, y, radius, {
                        restitution: item.restitution,
                        ...options,
                        render: commonRender,
                    });
                }

                const image = new Image();
                image.src = item.src;
                drawables.push({ body, height: item.height, image, kind: "image", width: item.width });
                bodies.push(body);
            } else if (item.kind === "shape") {
                let body: Body;

                if (item.shape === "triangle") {
                    body = Matter.Bodies.polygon(x, y, 3, 1, {
                        restitution: item.restitution,
                        ...options,
                        render: {
                            fillStyle: "transparent",
                            strokeStyle: "transparent",
                        },
                    });

                    const currentWidth = body.bounds.max.x - body.bounds.min.x;
                    const currentHeight = body.bounds.max.y - body.bounds.min.y;
                    const scaleX = item.width / currentWidth;
                    const scaleY = item.height / currentHeight;
                    Matter.Body.scale(body, scaleX, scaleY);
                    Matter.Body.setAngle(body, -Math.PI / 2);
                } else {
                    body = Matter.Bodies.rectangle(x, y, item.width, item.height, {
                        restitution: item.restitution,
                        ...options,
                        render: {
                            fillStyle: "transparent",
                            strokeStyle: "transparent",
                        },
                    });
                }

                drawables.push({
                    background: item.background,
                    body,
                    height: item.height,
                    kind: "shape",
                    shape: item.shape,
                    width: item.width,
                });
                bodies.push(body);
            } else {
                const body = Matter.Bodies.rectangle(x, y, item.width, item.height, {
                    chamfer: { radius: 12 },
                    restitution: item.restitution,
                    ...options,
                    render: {
                        fillStyle: "transparent",
                        strokeStyle: "transparent",
                    },
                });

                const canvas = createTextCanvas(item);

                drawables.push({
                    body,
                    canvas,
                    height: item.height,
                    kind: "text",
                    width: item.width,
                });
                bodies.push(body);
            }
        });

        drawablesRef.current = drawables;

        Matter.World.add(world, bodies);

        const mouse = Matter.Mouse.create(render.canvas);
        Matter.Mouse.setElement(mouse, container);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            constraint: {
                render: { visible: false },
                stiffness: 0.3,
            },
            mouse,
        });
        Matter.World.add(world, mouseConstraint);
        render.mouse = mouse;

        const applyPointerForce = (position: Matter.Vector) => {
            if (!position) return;
            const bodiesToAffect = Matter.Composite.allBodies(world);
            bodiesToAffect.forEach((body) => {
                if (body.isStatic) return;
                const delta = Matter.Vector.sub(body.position, position);
                const distance = Matter.Vector.magnitude(delta);
                if (distance === 0 || distance > POINTER_FORCE_RADIUS) return;
                const forceMagnitude = POINTER_FORCE * (1 - distance / POINTER_FORCE_RADIUS);
                const direction = Matter.Vector.normalise(delta);
                Matter.Body.applyForce(body, body.position, Matter.Vector.mult(direction, forceMagnitude));
            });
        };

        type MouseConstraintEvent = Matter.IEvent<Matter.MouseConstraint> & { mouse: Mouse };

        const handleMouseMove = (event: MouseConstraintEvent) => {
            applyPointerForce(event.mouse.position);
        };

        const handleMouseDown = (event: MouseConstraintEvent) => {
            const position = event.mouse.position;
            const bodiesToAffect = Matter.Composite.allBodies(world);
            bodiesToAffect.forEach((body) => {
                if (body.isStatic) return;
                const direction = Matter.Vector.normalise({
                    x: body.position.x - position.x + (Math.random() - 0.5) * 40,
                    y: body.position.y - position.y - Math.random() * 60,
                });
                Matter.Body.applyForce(body, body.position, Matter.Vector.mult(direction, CLICK_FORCE * (0.3 + Math.random() * 0.7)));
            });
        };

        const mouseMoveListener = (event: Matter.IEvent<MouseConstraint>) => {
            handleMouseMove(event as MouseConstraintEvent);
        };

        const mouseDownListener = (event: Matter.IEvent<MouseConstraint>) => {
            handleMouseDown(event as MouseConstraintEvent);
        };

        Matter.Events.on(mouseConstraint, "mousemove", mouseMoveListener);
        Matter.Events.on(mouseConstraint, "mousedown", mouseDownListener);

        const handleAfterRender = () => {
            const context = render.context;
            drawablesRef.current.forEach((drawable) => {
                const { body } = drawable;
                context.save();
                context.translate(body.position.x, body.position.y);
                context.rotate(body.angle);

                if (drawable.kind === "image") {
                    context.drawImage(drawable.image, -drawable.width / 2, -drawable.height / 2, drawable.width, drawable.height);
                } else if (drawable.kind === "shape") {
                    if (drawable.shape === "triangle") {
                        context.beginPath();
                        context.moveTo(0, -drawable.height / 2);
                        context.lineTo(-drawable.width / 2, drawable.height / 2);
                        context.lineTo(drawable.width / 2, drawable.height / 2);
                        context.closePath();
                        context.fillStyle = drawable.background;
                        context.fill();
                    } else {
                        context.fillStyle = drawable.background;
                        context.fillRect(-drawable.width / 2, -drawable.height / 2, drawable.width, drawable.height);
                    }
                } else {
                    context.drawImage(drawable.canvas, -drawable.width / 2, -drawable.height / 2, drawable.width, drawable.height);
                }
                context.restore();
            });
        };

        Matter.Events.on(render, "afterRender", handleAfterRender);

        Matter.Render.run(render);
        Matter.Runner.run(runner, engine);

        return () => {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
            Matter.World.clear(world, false);
            Matter.Engine.clear(engine);
            Matter.Events.off(mouseConstraint, "mousemove", mouseMoveListener);
            Matter.Events.off(mouseConstraint, "mousedown", mouseDownListener);
            Matter.Events.off(render, "afterRender", handleAfterRender);
            render.canvas.remove();
            render.textures = {};
        };
    }, [options]);

    return (
        <div className="border">
            <div className="relative h-[360px] w-full overflow-hidden border" ref={containerRef} />
        </div>
    );
}
