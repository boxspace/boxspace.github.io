function Demo() {
    this.setupScene();
    this.setupUniforms();
}

Demo.prototype.setupScene = function() {
    var igloo = this.igloo = new Igloo(document.getElementById('canvas'));
    igloo.gl.pixelStorei(igloo.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.quad = igloo.array(Igloo.QUAD2);
    this.images = {
        back: igloo.texture(document.getElementById('image')),
        front: igloo.texture(document.getElementById('image')),
    }
    var size = new Float32Array([image.naturalWidth, image.naturalHeight]);
    var img = document.getElementById('image');
    var canvas = document.getElementById('canvas');
    var cansize = new Float32Array([canvas.width, canvas.height]);
    this.sizes = {
        back: size,
        front: size,
        canvas: cansize,
    }
    this.framebuffer = igloo.framebuffer();
    this.programs = {
        copy: igloo.program('copy.vert', 'copy.frag'),
        render: igloo.program('shader.vert', 'shader.frag'),
    }
}

Demo.prototype.setupUniforms = function() {
    var vars = this.vars = Object.create(null);
    vars.timer = Date.now();
    
    var uniforms = this.uniforms = Object.create(null);
    uniforms.resolution = new Float32Array(canvas.width, canvas.height);
    uniforms.image = 0;
    uniforms.time = 0;
}

Demo.prototype.updateUniforms = function() {
    var uniforms = this.uniforms;
    uniforms.time = Date.now() - this.vars.timer;
}

Demo.prototype.writeUniforms = function() {
    
}

Demo.prototype.swap = function() {
    var front = this.images.front;
    this.images.front = this.images.back;
    this.images.back = front;
}

Demo.prototype.step = function() {
    this.framebuffer.attach(this.images.back);
    this.images.front.bind(0);
    this.igloo.gl.viewport(0, 0, this.sizes.front[0], this.sizes.front[1]);
    this.programs.copy.use()
        .attrib('points', this.quad, 2)
        .uniformi('image', 0)
        .draw(this.igloo.gl.TRIANGLE_STRIP, 4);
    this.swap();
}

Demo.prototype.draw = function() {
    this.igloo.defaultFramebuffer.bind();
    this.images.front.bind(0);
    this.igloo.gl.viewport(0, 0, this.sizes.canvas[0], this.sizes.canvas[1]);
    this.programs.copy.use();
    this.updateUniforms();
    this.programs.copy.use()
        .attrib('points', this.quad, 2)
        .uniformi('image', 0)
        .draw(this.igloo.gl.TRIANGLE_STRIP, 4);
};

var demo = null;
window.addEventListener('load', function() {
    demo = new Demo();
    function mainLoop() {
        demo.step();
        demo.draw();
        requestAnimationFrame(mainLoop);
    }
    mainLoop();
});
