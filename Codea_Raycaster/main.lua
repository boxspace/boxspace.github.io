-- Main

displayMode(FULLSCREEN)
--supportedOrientations(LANDSCAPE_ANY)
function setup()
    supportedOrientations(CurrentOrientation)
    res = HEIGHT / 2
    buf = image(res / 2, res / 2)
    --parameter.number("q", -90, 90, 0)
    qq = q
    height = 0.25
    width = 0.1 -- 0.2
    maxPos = 0.5 - width / 2
    height = math.min(height, maxPos)
    hardReload()
    
    parameter.watch("devMode.state")
    --[[--
    parameter.watch("m.shader.currCube")
    parameter.text("cube1")
    parameter.text("face1")
    parameter.text("cube2")
    parameter.text("trans2")
    parameter.action("Update", function()
                                    addLink(tonumber(cube1), tonumber(face1), tonumber(cube2), tonumber(trans2))
                                    loadShader2()
                                    m.shader.mapImg = map_img
                                end)
    --]]--
    
    --[[--
    parameter.watch("devMode.state")
    parameter.watch("devMode.cubeA")
    parameter.watch("devMode.side")
    --]]--
    
    parameter.text("mapName")
    parameter.action("Save", saveMap)
    parameter.action("Load", loadMap)
    
    parameter.boolean("arMode", false)
    parameter.watch("ar")
    
    --parameter.watch("m.shader.currPos")
    --parameter.watch("m.shader.right")
    --parameter.watch("m.shader.up")
    --parameter.watch("m.shader.facing")
    --parameter.watch("m.shader.facing:dot(m.shader.up)")
    --parameter.watch("view")
    --parameter.action("Soft Reload", softReload)
    parameter.action("Hard Reload", hardReload)
    fps = -1
    font("SourceSansPro-Regular")
    fontSize(20)
    textWrapWidth(70)
    noStroke()
    dims = {"x", "y", "z"}
    l = {}
    --[[--
    for k, v in pairs(map) do
        print(k)
    end
    print("--------")
    --]]--
    
    ua = vec3(0, 0, 0)
    ar = matrix()
    
    i = vec3()
end

function draw()
    background(0)
    
    noStroke()
    fill(95)
    rect(0, 0, (WIDTH - HEIGHT) / 2, HEIGHT)
    
    if (devMode.on) then
        fill(63, 63, 63)
        rect((WIDTH + HEIGHT) / 2, 0, (WIDTH - HEIGHT) / 2, HEIGHT / 2)
        
        fill(63, 127, 191)
        rect((WIDTH + HEIGHT) / 2, HEIGHT / 3, (WIDTH - HEIGHT) / 4, HEIGHT / 6)
        fill(191, 127, 63)
        rect((3 * WIDTH + HEIGHT) / 4, HEIGHT / 3, (WIDTH - HEIGHT) / 4, HEIGHT / 6)
        
        fill(63, 191, 63)
        rect((WIDTH + HEIGHT) / 2, HEIGHT / 6, (WIDTH - HEIGHT) / 4, HEIGHT / 6)
        fill(191, 63, 63)
        rect((3 * WIDTH + HEIGHT) / 4, HEIGHT / 6, (WIDTH - HEIGHT) / 4, HEIGHT / 6)
    end
    
    if (devMode.on) then
        devMode.state = devMode.newState
        if (devMode.state == 0) then
            devMode.cubeA = m.shader.currCube
        elseif (devMode.state == 1) then
            devMode.cubeB = m.shader.currCube
        elseif (devMode.state == 2) then
            
        elseif (devMode.state == 3) then
            loadShader2()
            m.shader.mapImg = map_img
            devMode.cubeA = 0
            devMode.cubeB = 0
            devMode.side = -1
            devMode.trans = 0
            
            devMode.newState = 0
        end
        m.shader.tintCubeA = devMode.cubeA
        m.shader.tintSideA = devMode.side
        local lb = map[devMode.cubeA * 6 + devMode.side - 5]
        if (devMode.state == 2 and lb) then
            m.shader.tintCubeB = devMode.cubeB
            m.shader.tintSideB = lb.side
        else
            m.shader.tintCubeB = -1
            m.shader.tintSideB = -1
        end
        m.shader.tintColor = vec3(0, 0, 1)
    end
    
    --m.shader.time = m.shader.time + DeltaTime
    setContext(buf)
    m:draw()
    setContext()
    
    pushMatrix()
    translate(WIDTH / 2, HEIGHT / 2)
    scale(HEIGHT / (res / 2))
    sprite(buf, 0, 0)
    popMatrix()
    
    factor = math.pow(0.001, DeltaTime)
    currVel = currVel * factor + targetVel * (1 - factor)
    m.shader.currPos = m.shader.currPos + currVel * DeltaTime
    
    for i, d in ipairs(dims) do
        if (math.abs(m.shader.currPos[d]) > maxPos) then
            next = map[m.shader.currCube * 6 + i * 2 - sign(m.shader.currPos[d]) * 0.5 - 6.5]
            if (next == nil) then
                m.shader.currPos[d] = sign(m.shader.currPos[d]) * maxPos
                targetVel[d] = 0
                currVel[d] = 0
            else
                if (math.abs(m.shader.currPos[d]) > 0.5) then
                    --print(m.shader.currCube, next.links)
                    m.shader.currPos[d] = m.shader.currPos[d] - sign(m.shader.currPos[d])
                    
                    local arMat = matrix(arMove.right.x, arMove.up.x, arMove.facing.x, 0, arMove.right.y, arMove.up.y, arMove.facing.y, 0, arMove.right.z, arMove.up.z, arMove.facing.z, 0, 0, 0, 0, 1):inverse()
                    local arDot = {}
                    arDot.right = transform(m.shader.right, arMat)
                    arDot.up = transform(m.shader.up, arMat)
                    arDot.facing = transform(m.shader.facing, arMat)
                    
                    ar = matrix(m.shader.right.x, m.shader.up.x, m.shader.facing.x, 0, 
                                m.shader.right.y, m.shader.up.y, m.shader.facing.y, 0, 
                                m.shader.right.z, m.shader.up.z, m.shader.facing.z, 0, 
                                0, 0, 0, 1)
                    --ar = ar * 
                    
                    --print(m.shader.right)
                    --print(m.shader.up)
                    --print(m.shader.facing)
                    
                    local pos = m.shader.currPos
                    local proj = {}
                    proj.currVel = pos + currVel
                    proj.targetVel = pos + targetVel
                    proj.right = pos + m.shader.right
                    proj.up = pos + m.shader.up
                    proj.facing = pos + m.shader.facing
                    
                    local arProj = {}
                    arProj.right = pos + arMove.right
                    arProj.up = pos + arMove.up
                    arProj.facing = pos + arMove.facing
                    
                    local inverse = next.trans
                    local posInv = twistr(pos, inverse)
                    pos = twistr(pos, next.trans)
                    proj.currVel = twistr(proj.currVel, next.trans)
                    proj.targetVel = twistr(proj.targetVel, next.trans)
                    proj.right = twistr(proj.right, inverse)
                    proj.up = twistr(proj.up, inverse)
                    proj.facing = twistr(proj.facing, inverse)
                    
                    arProj.right = twistr(arProj.right, inverse)
                    arProj.up = twistr(arProj.up, inverse)
                    arProj.facing = twistr(arProj.facing, inverse)
                    
                    currVel = proj.currVel - pos
                    targetVel = proj.targetVel - pos
                    --m.shader.right = proj.right - posInv
                    --m.shader.up = proj.up - posInv
                    --m.shader.facing = proj.facing - posInv
                    
                    --arMove.right = arProj.right - posInv
                    --arMove.up = arProj.up - posInv
                    --arMove.facing = arProj.facing - posInv
                    am = matrix(arMove.right.x, arMove.up.x, arMove.facing.x, 0, 
                                arMove.right.y, arMove.up.y, arMove.facing.y, 0, 
                                arMove.right.z, arMove.up.z, arMove.facing.z, 0, 
                                0, 0, 0, 1)
                    
                    --arMat = arMat * matrix(arMove.right.x, arMove.up.x, arMove.facing.x, 0, arMove.right.y, arMove.up.y, arMove.facing.y, 0, arMove.right.z, arMove.up.z, arMove.facing.z, 0, 0, 0, 0, 1)
                    
                    print(arMove.right)
                    print(arMove.up)
                    print(arMove.facing)
                    
                    --ar = ar * arMat
                    tw = {}
                    tw.right = twistr(vec3(1, 0, 0), inverse)
                    tw.up = twistr(vec3(0, 1, 0), inverse)
                    tw.facing = twistr(vec3(0, 0, 1), inverse)
                    tw.mat = matrix(tw.right.x, tw.up.x, tw.facing.x, 0, 
                                    tw.right.y, tw.up.y, tw.facing.y, 0, 
                                    tw.right.z, tw.up.z, tw.facing.z, 0, 
                                    0, 0, 0, 1):transpose()
                    ar = ar * tw.mat
                    
                    m.shader.right = vec3(ar[1], ar[5], ar[9])
                    m.shader.up = vec3(ar[2], ar[6], ar[10])
                    m.shader.facing = vec3(ar[3], ar[7], ar[11])
                    
                    am = am * tw.mat
                    arMove.right = vec3(am[1], am[5], am[9])
                    arMove.up = vec3(am[2], am[6], am[10])
                    arMove.facing = vec3(am[3], am[7], am[11])
                    
                    --m.shader.right = transform(arDot.right, arMat)
                    --m.shader.up = transform(arDot.up, arMat)
                    --m.shader.facing = transform(arDot.facing, arMat)
                    
                    --print(m.shader.right)
                    --print(m.shader.up)
                    --print(m.shader.facing)
                    
                    m.shader.currPos = pos
                    m.shader.currCube = next.links
                end
            end
        end
    end
    
    --m.shader.currPos.y = height - 0.5
    
    if (q ~= qq) then
        rotView(q - qq, 0, 0, 1)
        qq = q
    end
    
    if (ElapsedTime < 1) then
        fps = 1 / DeltaTime
        str = "?? fps"
    else
        factor = math.pow(0.5, DeltaTime)
        fps = fps * factor + (1 - factor) / DeltaTime
        str = math.ceil(fps - 0.25) .. " fps"
    end
    w, h = textSize(str)
    fill(255)
    text(str, WIDTH - w / 2, h / 2)
    
    if (touches and touches.walk) then
        fill(255, 127)
        ellipse(touches.walk.start.x, touches.walk.start.y, 100)
    end
    if (touches and touches.fly) then
        fill(255, 127)
        rect(touches.fly.start.x - 25, touches.fly.start.y - 75, 50, 150)
    end
    
    if (arMode) then
        ar = matrix(m.shader.right.x, m.shader.up.x, m.shader.facing.x, 0, 
                    m.shader.right.y, m.shader.up.y, m.shader.facing.y, 0, 
                    m.shader.right.z, m.shader.up.z, m.shader.facing.z, 0, 
                    0, 0, 0, 1)
        ar = ar:rotate(-math.deg(RotationRate.x) * DeltaTime, 1, 0, 0):rotate(-math.deg(RotationRate.y) * DeltaTime, 0, 1, 0):rotate(math.deg(RotationRate.z) * DeltaTime, 0, 0, 1)
        m.shader.right = vec3(ar[1], ar[5], ar[9])
        m.shader.up = vec3(ar[2], ar[6], ar[10])
        m.shader.facing = vec3(ar[3], ar[7], ar[11])
    end
    
    if (arMode) then
        targetVel = vec3(0, touches.look and 1 or 0, touches.walk and 1 or 0) * (touches.fly and -1 or 1)
        --i = i + (UserAcceleration * math.dot(UserAcceleration)) * DeltaTime
        --targetVel = i * 10
        targetVel = transform(targetVel, ar)
        
        targetVel = transform(targetVel, matrix(arMove.right.x, arMove.up.x, arMove.facing.x, 0, arMove.right.y, arMove.up.y, arMove.facing.y, 0, arMove.right.z, arMove.up.z, arMove.facing.z, 0, 0, 0, 0, 1):inverse())
        --targetVel.y = 0
        targetVel = transform(targetVel, matrix(arMove.right.x, arMove.up.x, arMove.facing.x, 0, arMove.right.y, arMove.up.y, arMove.facing.y, 0, arMove.right.z, arMove.up.z, arMove.facing.z, 0, 0, 0, 0, 1))
    end
end

function smpl(n, thresh)
    thresh = thresh or maxPos
    return math.max(-1, math.min(1, n / thresh - math.fmod(n / thresh, 1)))
end

function sign(n)
    return (n == 0) and 0 or n / math.abs(n)
end

function test(i, n)
    return i * 2 - sign(n) * 0.5 - 1.5
end

function whichSide(v)
    local u = vec3(sign(v.x), sign(v.y), sign(v.z))
    local w = vec3(u.x * v.x, u.y * v.y, u.z * v.z)
    if (w.x >= w.y and w.x >= w.z) then
        return (u.x + 1) / 2
    elseif (w.y >= w.x and w.y >= w.z) then
        return (u.y + 3) / 2
    else
        return (u.z + 5) / 2
    end
end

function transform(v, m)
    x = v.x; y = v.y; z = v.z
    return vec3(x * m[1] + y * m[5] + z * m[9], 
                x * m[2] + y * m[6] + z * m[10], 
                x * m[3] + y * m[7] + z * m[11])
end

function transView(id)
    view = view * twistr2(id):transpose()
    m.shader.right = vec3(view[1], view[5], view[9])
    m.shader.up = vec3(view[2], view[6], view[10])
    m.shader.facing = vec3(view[3], view[7], view[11])
end

function touched(touch)
    if (touch.state == BEGAN) then
        if (math.abs(WIDTH / 2 - touch.x) <= HEIGHT / 2) then
            touches.look = touches.look or {id = touch.id, start = vec2(touch.x, touch.y)}
        elseif (touch.x < WIDTH / 2) then
            touches.walk = touches.walk or {id = touch.id, start = vec2(touch.x, touch.y)}
        else
            touches.fly = touches.fly or {id = touch.id, start = vec2(touch.x, touch.y)}
            
            if (devMode.on and touch.y < HEIGHT / 2) then
                if (touch.y > HEIGHT / 3) then
                    if (touch.x < (3 * WIDTH + HEIGHT) / 4) then
                        if (devMode.state == 0) then
                            devMode.side = (devMode.side >= 5) and 0 or devMode.side + 1
                        elseif (devMode.state == 1) then
                            devMode.side = -1 - devMode.side
                        elseif (devMode.state == 2) then
                            if (lad) then
                                delLink(devMode.cubeA, devMode.side, devMode.cubeB, devMode.trans)
                            end
                            devMode.trans = (devMode.trans >= 23) and 0 or devMode.trans + 1
                            lad = addLink(devMode.cubeA, devMode.side, devMode.cubeB, devMode.trans)
                            loadShader2()
                            m.shader.mapImg = map_img
                        end
                    else
                        if (devMode.state == 0) then
                            devMode.side = (devMode.side <= 0) and 5 or devMode.side - 1
                        elseif (devMode.state == 1) then
                            devMode.side = -1 - devMode.side
                        elseif (devMode.state == 2) then
                            lad = lad or false
                            if (lad) then
                                delLink(devMode.cubeA, devMode.side, devMode.cubeB, devMode.trans)
                            end
                            devMode.trans = (devMode.trans <= 0) and 23 or devMode.trans - 1
                            lad = addLink(devMode.cubeA, devMode.side, devMode.cubeB, devMode.trans)
                            loadShader2()
                            m.shader.mapImg = map_img
                        end
                    end
                elseif (touch.y > HEIGHT / 6) then
                    if (touch.x < (3 * WIDTH + HEIGHT) / 4) then
                        devMode.newState = devMode.state + 1
                        if (devMode.state == 0) then
                            if (devMode.side == -1) then
                                devMode.newState = devMode.state
                            else
                                --devMode.side = -1
                            end
                        end
                        if (devMode.state == 1) then
                            if (devMode.side == -1) then
                                --devMode.newState = devMode.state
                            end
                        end
                    else
                        devMode.newState = (devMode.state > 1) and devMode.state - 1 or 0
                        if (devMode.state == 0) then 
                            devMode.side = -1
                        elseif (devMode.state == 2) then
                            print("delete")
                            if (lad) then
                                delLink(devMode.cubeA, devMode.side, devMode.cubeB, devMode.trans)
                            end
                            lad = false
                            loadShader2()
                            m.shader.mapImg = map_img
                            
                            --devMode.side = -1
                        end
                    end
                end
            end
        end
    elseif (touch.state == MOVING) then
        if (touches.look and touches.look.id == touch.id) then
            theta = math.fmod(theta + touch.deltaX * 360 / WIDTH, 360)
            phi = math.min(math.max(phi + touch.deltaY * 270 / HEIGHT, -90), 90)
            m.shader.theta = math.rad(theta)
            m.shader.phi = math.rad(phi)
        elseif (touches.walk and touches.walk.id == touch.id) then
            stick = vec2(touch.x, touch.y) - touches.walk.start
            stick = stick / 50
            if (stick:lenSqr() > 1) then
                stick = stick:normalize()
            elseif (stick:lenSqr() < 0.4) then
                stick = vec2()
            else
                stick = stick * (stick:len() - 0.2) / 0.8
            end
            stick = stick * speed
        elseif (touches.fly and touches.fly.id == touch.id) then
            fly = touch.y - touches.fly.start.y
            fly = fly / 75
            if (math.abs(fly) > 1) then
                fly = sign(fly)
            elseif (math.abs(fly) < 0.2) then
                fly = 0
            else
                fly = fly * (math.abs(fly) - 0.2) / 0.8
            end
        end
    elseif (touch.state == ENDED) then
        if (touches.look and touches.look.id == touch.id) then
            touches.look = nil
        elseif (touches.walk and touches.walk.id == touch.id) then
            touches.walk = nil
            stick = vec2()
        elseif (touches.fly and touches.fly.id == touch.id) then
            touches.fly = nil
            fly = 0
            
            if (touch.tapCount == 3. and touch.y < 30) then
                devMode.on = not devMode.on
            end
        end
   end
    temp = stick:rotate(-m.shader.theta)
    
    am = matrix(arMove.right.x, arMove.up.x, arMove.facing.x, 0, 
                                arMove.right.y, arMove.up.y, arMove.facing.y, 0, 
                                arMove.right.z, arMove.up.z, arMove.facing.z, 0, 
                                0, 0, 0, 1)
    temp = transform(vec3(temp.x, fly, temp.y), am)
    if (not arMode) then
        targetVel = vec3(temp.x, temp.y, temp.z)
    end
end

function hardReload()
    loadShader()
    --fsh_head = ""
    loadShader2()
    saveImage("Documents:Map", map_img)
    local new = mesh()
    new.shader = shader("Documents:Template")
    new.shader.fragmentProgram = fsh_head..fsh_body
    saveProjectTab("Raycaster+Debug:Fsh", new.shader.fragmentProgram)
    new.shader.mapImg = map_img
    new.shader.mapSize = vec2(map_img.width, map_img.height) / 2
    new.shader.time = 60
    
    new.shader.currPos = vec3(0, height - 0.5, 0)
    currVel = vec3(0, 0, 0)
    targetVel = vec3(0, 0, 0)
    touches = {}
    stick = vec2()
    fly = 0
    speed = 0.75
    btnLeft = false
    btnRight = false
    btnForward = false
    btnBackward = false
    climb = false
    climbing = 0
    normal = vec3(0, 1, 0)
    theta = 0
    phi = 0
    
    arMove = {
        up = vec3(0, 1, 0), 
        facing = vec3(0, 0, 1), 
        right = vec3(1, 0, 0)
    }
    
    devMode = {
        on = false, 
        state = 0, 
        newState = 0, 
        cubeA = 0, 
        cubeB = 0, 
        side = -1, 
        trans = 0
    }
    
    new.shader.tintCubeA = -1
    new.shader.tintSideA = -1
    new.shader.tintCubeB = -1
    new.shader.tintSideB = -1
    new.shader.tintColor = vec3(1, 0, 1)
    
    shaderParams = shaderParams or {
        maxDist = 10, 
        currCube = 1, 
        up = vec3(0, 1, 0), 
        facing = vec3(0, 0, 1), 
        right = vec3(1, 0, 0), 
        theta = 0, 
        phi = 0, 
        fov = 100
    }
    shaderParams.maxDist = maxDist or shaderParams.maxDist
    for k, v in pairs(shaderParams) do
        new.shader[k] = v
    end
    new:addRect(res / 4, res / 4, res / 2, res / 2)
    m = new
    print(m.shader)
end
