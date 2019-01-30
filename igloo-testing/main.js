function Demo() {
    this.setupScene();
    this.setupUniforms();
}

Demo.prototype.setupScene = function() {
    var igloo = this.igloo = new Igloo(document.getElementById('canvas'));
    igloo.gl.pixelStorei(igloo.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.quad = igloo.array(Igloo.QUAD2);
    this.image = igloo.texture(document.getElementById('image'));
    this.program = igloo.program('shader.vert', 'shader.frag');
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

Demo.prototype.draw = function() {
    this.image.bind(0);
    this.program.use();
    this.updateUniforms();
    this.program
        .attrib('points', this.quad, 2)
        .draw(this.igloo.gl.TRIANGLE_STRIP, Igloo.QUAD2.length / 2);
};

var demo = null;
window.addEventListener('load', function() {
    demo = new Demo();
    function mainLoop() {
        demo.draw();
        requestAnimationFrame(mainLoop);
    }
    mainLoop();
});
