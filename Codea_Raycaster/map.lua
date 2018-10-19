-- Map

map = {size = 1}
inverted = {0, 2, 1, 15, 4, 23, 6, 14, 19, 9, 10, 11, 12, 20, 7, 3, 22, 17, 18, 8, 13, 21, 16, 5}

function twistr(v, id)
    u = v
    a = math.fmod(id, 3)
    b = math.fmod(math.floor(id / 3), 2)
    c = math.fmod(math.floor(id / 6), 2)
    d = math.fmod(math.floor(id / 12), 2)
    
    u = (a == 1) and vec3(u.y, u.z, u.x) or u
    u = (a == 2) and vec3(u.z, u.x, u.y) or u
    u = (b == 1) and vec3(u.x, u.z, -u.y) or u
    u = (c == 1) and vec3(-u.x, -u.y, u.z) or u
    u = (d == 1) and vec3(u.x, -u.y, -u.z) or u
    
    return u
end

function untwistr(v, id)
    u = v
    a = math.fmod(id, 3)
    b = math.fmod(math.floor(id / 3), 2)
    c = math.fmod(math.floor(id / 6), 2)
    d = math.fmod(math.floor(id / 12), 2)
    
    u = (c == 1) and vec3(-u.x, -u.y, u.z) or u
    u = (d == 1) and vec3(u.x, -u.y, -u.z) or u
    u = (b == 1) and vec3(u.x, -u.z, u.y) or u
    u = (a == 1) and vec3(u.z, u.x, u.y) or u
    u = (a == 2) and vec3(u.y, u.z, u.x) or u
    
    return u
end

function twistr2(id)
    a = math.fmod(id, 3)
    b = math.fmod(math.floor(id / 3), 2)
    c = math.fmod(math.floor(id / 6), 2)
    d = math.fmod(math.floor(id / 12), 2)
    
    mat = matrix()
    mat = mat:rotate(-120 * a, 1, 1, 1)
    mat = mat:rotate(-90 * b, 1, 0, 0)
    mat = mat:scale(1 - 2 * c, 1 - 2 * c, 1)
    mat = mat:scale(1, 1 - 2 * d, 1 - 2 * d)
    
    return mat
end

function genLink(cubeA, sideA, cubeB, transform)
    transform = transform or 0
    local sign = 1 - 2 * math.fmod(sideA, 2)
    sign = -1 * sign    -- Remember, we want the opposite side
    local testVec = vec3((sideA == 0 or sideA == 1) and sign or 0,
                         (sideA == 2 or sideA == 3) and sign or 0,
                         (sideA == 4 or sideA == 5) and sign or 0 )
    testVec = twistr(testVec, transform)
    local sideB = 0.5 * (testVec.x * (1 * testVec.x - 1) + testVec.y * (5 * testVec.y - 1) + testVec.z * (9 * testVec.z - 1))
    local free = map[cubeA * 6 + sideA - 5] or map[cubeB * 6 + sideB - 5]
    local size = math.max(map.size, math.max(cubeA, cubeB))
    local transA = transform
    local transB = inverted[transform + 1]
    
    return {
        cubeA = cubeA, 
        cubeB = cubeB, 
        sideA = sideA, 
        sideB = sideB, 
        transA = transA, 
        transB = transB, 
        indexA = cubeA * 6 + sideA - 5, 
        indexB = cubeB * 6 + sideB - 5, 
        linkA = {links=cubeB, trans=transA, side=sideB}, 
        linkB = {links=cubeA, trans=transB, side=sideA}, 
        size = math.max(map.size, math.max(cubeA, cubeB)), 
        free = not (cubeA * 6 + sideA == cubeB * 6 + sideB) and not map[cubeA * 6 + sideA - 5] and not map[cubeB * 6 + sideB - 5], 
        exists = map[cubeA * 6 + sideA - 5] and map[cubeB * 6 + sideB - 5]
    }
end

function addLink(cubeA, sideA, cubeB, transform)
    local link = genLink(cubeA, sideA, cubeB, transform)
    
    if (link.free) then
        map.size = link.size
        map[link.indexA] = link.linkA
        map[link.indexB] = link.linkB
        print("Successful addLink("..tostring(cubeA)..", "..tostring(sideA)..", "..tostring(cubeB)..(transform and ", "..tostring(transform) or "")..")")
    else
        print("Error during addLink("..tostring(cubeA)..", "..tostring(sideA)..", "..tostring(cubeB)..(transform and ", "..tostring(transform) or "").."): portal already in place")
    end
    
    return link.free
end

function delLink(cubeA, sideA, cubeB, transform)
    local link = genLink(cubeA, sideA, cubeB, transform)
    
    if (link.exists) then
        map[link.indexA] = nil
        map[link.indexB] = nil
        print("Successful delLink("..tostring(cubeA)..", "..tostring(sideA)..", "..tostring(cubeB)..(transform > 0 and ", "..tostring(transform) or "")..")")
    else
        print("Error during delLink("..tostring(cubeA)..", "..tostring(sideA)..", "..tostring(cubeB)..(transform and ", "..tostring(transform) or "").."): portal does not exist")
    end
    
    return link.free
end

--------------------------------

--[[-- Basic loop
addLink(1, 4, 2)
addLink(1, 5, 2, 3)
--addLink(1, 1, 3, 23)
--]]--
---[[-- Order 5
addLink(1, 0, 2)
addLink(2, 0, 3, 23)
addLink(3, 0, 4)
addLink(4, 0, 5, 23)
addLink(5, 0, 6)
addLink(6, 0, 7, 23)
addLink(7, 0, 8)
addLink(8, 0, 9, 23)
addLink(9, 0, 10)
addLink(10, 0, 1, 23)

addLink(1, 3, 11)
addLink(11, 3, 1)
--]]--
--[[-- Boggled
addLink(1, 4, 1, 1)
addLink(1, 5, 1, 1)
addLink(1, 0, 2)
addLink(1, 1, 3)
addLink(2, 4, 3)
addLink(3, 4, 2)
addLink(2, 2, 4)
addLink(3, 3, 4)
addLink(4, 0, 4, 3)
maxDist = 6
--]]--
--[[-- Upside Down
addLink(1, 4, 2)
addLink(2, 4, 3, 23)

addLink(3, 4, 4)
addLink(4, 4, 5)
addLink(5, 0, 6)
addLink(6, 5, 7, 18)
addLink(7, 4, 8)
addLink(1, 2, 15)

addLink(9, 4, 10)
addLink(10, 4, 11)
addLink(11, 0, 12)
addLink(12, 5, 13, 18)
addLink(13, 4, 14)
addLink(9, 2, 15, 6)

addLink(8, 1, 14, 23)
--]]--
--[[-- Upside Down
addLink(1, 4, 2)
addLink(1, 5, 3, 18)

addLink(2, 4, 4)
addLink(3, 4, 5)
addLink(4, 0, 6)
addLink(5, 0, 7)

addLink(4, 1, 8)
--]]--
--[[-- Upside Down 2
addLink(1, 4, 13, 5)
addLink(100, 0, 2)
addLink(2, 0, 3)
addLink(4, 0, 5)
addLink(5, 0, 6)
addLink(7, 0, 8)
addLink(8, 0, 9)

addLink(10, 0, 11)
addLink(11, 0, 12)
addLink(13, 0, 14)
addLink(14, 0, 15)
addLink(16, 0, 17)
addLink(17, 0, 18)

addLink(100, 4, 4)
addLink(4, 4, 7)
addLink(2, 4, 5)
addLink(5, 4, 8)
addLink(3, 4, 6)
addLink(6, 4, 9)

addLink(10, 4, 13)
addLink(13, 4, 16)
addLink(11, 4, 14)
addLink(14, 4, 17)
addLink(12, 4, 15)
addLink(15, 4, 18)

addLink(19, 4, 20)
addLink(20, 4, 21)
addLink(22, 4, 23)
addLink(23, 4, 24)

addLink(100, 2, 19)
addLink(19, 2, 10)
addLink(4, 2, 20)
--addLink(20, 2, 13)
addLink(7, 2, 21)
addLink(21, 2, 16)

addLink(3, 2, 22)
addLink(22, 2, 12)
addLink(6, 2, 23)
addLink(23, 2, 15)
addLink(9, 2, 24)
addLink(24, 2, 18)

addLink(8, 4, 25)
addLink(25, 4, 26, 23)
addLink(26, 4, 27, 23)
addLink(27, 4, 28)
addLink(28, 4, 17, 12)

addLink(11, 5, 29)
addLink(29, 5, 30, 23)
addLink(30, 5, 31, 23)
addLink(31, 5, 32)
addLink(32, 5, 2, 12)

maxDist = 12
--]]--
--[[-- Portals
addLink(1, 0, 2)
addLink(2, 0, 3)

addLink(10, 0, 11)
addLink(11, 0, 12)
--addLink(13, 0, 14)
--addLink(14, 0, 15)
addLink(16, 0, 17)
addLink(17, 0, 18)

addLink(1, 2, 10)
addLink(2, 2, 11)
addLink(3, 2, 12)
addLink(4, 2, 13)
addLink(5, 2, 15)
addLink(6, 2, 16)
addLink(7, 2, 18)

addLink(1, 4, 4)
addLink(4, 4, 6)
addLink(3, 4, 5)
addLink(5, 4, 7)

addLink(10, 4, 13)
addLink(13, 4, 16)
--addLink(11, 4, 14)
addLink(14, 4, 17)
addLink(12, 4, 15)
addLink(15, 4, 18)

addLink(3, 0, 8, 23)
addLink(8, 4, 17, 18)

addLink(14, 5, 9, 5)
addLink(9, 5, 13, 19)

addLink(6, 3, 7, 16)
--addLink(6, 3, 3, 16)
--addLink(6, 3, 8)
--]]--
--[[-- Corridor
addLink(1, 0, 2)
addLink(2, 0, 3)
addLink(4, 0, 5)
addLink(5, 0, 6)
addLink(1, 4, 4)
addLink(2, 4, 5)
addLink(3, 4, 6)

addLink(4, 4, 7)
addLink(7, 4, 8)
addLink(8, 4, 9)
addLink(9, 4, 10)
addLink(10, 4, 11)
addLink(11, 4, 12)
addLink(12, 4, 13)
addLink(13, 4, 14)
addLink(14, 4, 15)

addLink(6, 4, 16)
addLink(16, 4, 17)

addLink(15, 0, 18)
addLink(18, 0, 17)

addLink(1, 2, 19)
addLink(3, 2, 20)
addLink(15, 2, 21)
addLink(17, 2, 22)

addLink(19, 2, 23)
addLink(20, 2, 24)
addLink(21, 2, 25)
addLink(22, 2, 26)

addLink(23, 0, 24)
addLink(25, 0, 26)

addLink(23, 4, 25)
addLink(24, 4, 26)
--]]--
--[[-- Missing Piece
addLink(2, 0, 1)
addLink(1, 0, 3)
addLink(3, 0, 4)
addLink(4, 0, 2)

addLink(5, 0, 6)
addLink(6, 0, 7)
addLink(7, 0, 5)

addLink(8, 0, 9)
addLink(9, 0, 10)
addLink(10, 0, 11)
addLink(11, 0, 8)

addLink(12, 0, 13)
addLink(13, 0, 14)

addLink(2, 4, 5)
addLink(5, 4, 8)
addLink(8, 4, 12)
addLink(12, 4, 2)

addLink(1, 4, 9)
addLink(9, 4, 13)
addLink(13, 4, 1)

addLink(3, 4, 6)
addLink(6, 4, 10)
addLink(10, 4, 14)
addLink(14, 4, 3)

addLink(4, 4, 7)
addLink(7, 4, 11)

maxDist = 16
--]]--
--[[-- Grates
addLink(1, 0, 2)
addLink(2, 0, 3)
addLink(3, 0, 4)

addLink(5, 0, 6)
addLink(6, 0, 7)
addLink(7, 0, 8)

addLink(9, 0, 10)
addLink(10, 0, 11)
addLink(11, 0, 12)

addLink(13, 0, 14)
addLink(14, 0, 15)
addLink(15, 0, 16)

addLink(17, 0, 18)
addLink(18, 0, 19)
addLink(19, 0, 20)

addLink(21, 0, 22)
addLink(22, 0, 23)
addLink(23, 0, 24)

addLink(1, 4, 5)
addLink(2, 4, 10)
addLink(3, 4, 7)
addLink(4, 4, 12)

addLink(6, 4, 14)
addLink(8, 4, 16)

addLink(9, 4, 17)
addLink(11, 4, 19)

addLink(13, 4, 21)
addLink(18, 4, 22)
addLink(15, 4, 23)
addLink(20, 4, 24)
--]]--
--[[-- Revolving Door
addLink(1, 4, 1, 23)
addLink(1, 1, 2, 18)
addLink(2, 4, 2, 23)
addLink(1, 2, 2)

maxDist = 12
--]]--
--[[-- 2x2
addLink(1, 0, 2)
addLink(3, 0, 4)

addLink(5, 0, 6)
addLink(7, 0, 8)

addLink(1, 5, 3)
addLink(2, 5, 4)

addLink(5, 5, 7)
addLink(6, 5, 8)

addLink(1, 2, 5)
addLink(2, 2, 6)

addLink(3, 2, 7)
addLink(4, 2, 8)

addLink(2, 4, 5, 4)

addLink(6, 2, 5, 6)

addLink(4, 3, 8, 4)

addLink(7, 1, 3, 6)
--]]--
--[[-- Hypercube
addLink(1, 0, 2)
addLink(1, 1, 3)
addLink(1, 2, 4)
addLink(1, 3, 5)
addLink(1, 4, 6)
addLink(1, 5, 7)

addLink(2, 0, 8)
addLink(3, 1, 9)
addLink(4, 2, 10)
addLink(5, 3, 11)
addLink(6, 4, 12)
addLink(7, 5, 13)

addLink(8, 0, 14)
addLink(9, 1, 15)
addLink(10, 2, 16)
addLink(11, 3, 17)
addLink(12, 4, 18)
addLink(13, 5, 19)

addLink(8, 2, 20)
addLink(20, 2, 10, 22)
addLink(8, 3, 21)
addLink(21, 3, 11, 16)
addLink(9, 2, 22)
addLink(22, 2, 10, 16)
addLink(9, 3, 23)
addLink(23, 3, 11, 22)

addLink(10, 4, 24)
addLink(24, 4, 12, 15)
addLink(10, 5, 25)
addLink(25, 5, 13, 3)
addLink(11, 4, 26)
addLink(26, 4, 12, 3)
addLink(11, 5, 27)
addLink(27, 5, 13, 15)

addLink(12, 0, 28)
addLink(28, 0, 8, 5)
addLink(12, 1, 29)
addLink(29, 1, 9, 23)
addLink(13, 0, 30)
addLink(30, 0, 8, 23)
addLink(13, 1, 31)
addLink(31, 1, 9, 5)

--addLink(32, 0, 15)
--addLink(32, 1, 14)
--addLink(32, 2, 17)
--addLink(32, 3, 16)
--addLink(32, 4, 19)
--addLink(32, 5, 18)
maxDist = 18
--]]--
--[[-- Tetrahedron
addLink(1, 0, 2, 21)
addLink(1, 2, 3, 17)
addLink(1, 4, 4, 4)
addLink(2, 4, 3, 4)
addLink(2, 2, 4, 17)
addLink(3, 0, 4, 21)
--]]--

--------------------------------

function saveMap()
    if (mapName == "") then
        for k, v in pairs(listProjectData()) do
            print(k)
        end
    end
    fname = "Documents:raycaster_map_"..mapName
    saveImage(fname, map_img)
    print("Saved map "..fname)
end

function loadMap()
    getShader2(mapName)
    hardReload()
    if (true) then return nil end
    
    if (mapName == "") then
        for k, v in pairs(listProjectData()) do
            print(k)
        end
    end
    fname = "raycaster_map_"..mapName
    local newMap = readProjectData(fname)
    if (newMap == nil) then
        print("Error: could not find map "..fname)
    else
        print("Loaded map "..fname)
    end
end

--------------------------------

function loadShader()
    fsh_head = {"precision highp float;\n"}
    if (dead) then table.insert(fsh_head, "DO NOT RUN;") end
    table.insert(fsh_head, "float links[" .. map.size * 6 .. "];")
    table.insert(fsh_head, "float trans[" .. map.size * 6 .. "];")
    table.insert(fsh_head, "\nvoid initArray()\n{")
    for i = 1, map.size * 6 do
        --table.insert(fsh_head, "links[" .. i-1 .. "] = " .. (map[i] and map[i].links or 0) .. ".;")
        --table.insert(fsh_head, "trans[" .. i-1 .. "] = " .. (map[i] and map[i].trans or 0) .. ".;")
    end
    table.insert(fsh_head, "}\n")
    fsh_head = table.concat(fsh_head, "\n")
    fsh_head = ""
    print(fsh_head)
end

function loadShader2()
    if (map_img) then return end
    map_img = image(res, res)
    map_img.premultiplied = true
    --setContext(map_img)
    --background(0, 0)
    --setContext()
    
    local w, h = optimalFit(map.size, 3)
    w, h = w * 2, h * 2
    map_img = map_img:copy(1, 1, w, h)
    print("w", w, "h", h, "n", map.size)
    
    local i = 0
    for y = 1, h, 2 do
        for x = 1, w, 6 do
            
            col_a = color(map[i + 1] and map[i + 1].links or 0,
                    map[i + 1] and map[i + 1].trans or 0,
                    map[i + 2] and map[i + 2].links or 0,
                    (map[i + 2] and map[i + 2].trans or 0) + 1)
            col_b = color(map[i + 3] and map[i + 3].links or 0,
                    map[i + 3] and map[i + 3].trans or 0,
                    map[i + 4] and map[i + 4].links or 0,
                    (map[i + 4] and map[i + 4].trans or 0) + 1)
            col_c = color(map[i + 5] and map[i + 5].links or 0,
                    map[i + 5] and map[i + 5].trans or 0,
                    map[i + 6] and map[i + 6].links or 0,
                    (map[i + 6] and map[i + 6].trans or 0) + 1)
            
            --print(col_a)
            --print(col_b)
            --print(col_c)
            
            for j = 0, 1 do
                for k = 0, 1 do
                    map_img:set(x + 0 + j, y + k, col_a)
                    map_img:set(x + 2 + j, y + k, col_b)
                    map_img:set(x + 4 + j, y + k, col_c)
                end
            end
            i = i + 6
        end
    end
end

function optimalFit(n, b)
    b = b or 1
    local s = math.sqrt(b * n)
    
    local wa = math.ceil(s / b) * b
    local hb = math.ceil(s)
    local ha = math.ceil(s * s / wa)
    local wb = math.ceil(s * s / hb / b) * b
    
    if (wa * wa + ha * ha < wb * wb + hb * hb) then
        return wa, ha
    end
    return wb, hb
end

function getShader2(name)
    map_img = readImage("Documents:raycaster_map_"..name)
    map_img = readImage("Documents:Map")
    if (true) then return end
    if (map_img == nil) then
        print("Error during getShader2("..tostring(name).."): map not found")
    end
    new = {}
    w, h = map_img.width, map_img.height
    new.size = (w / 2) * (h / 2) / 3
    for i = 1, new.size do
        new[i] = {}
    end
    
    local i = 0
    for y = 1, h, 2 do
        for x = 1, w, 6 do
            --print("g", x, y)
            colA = color(map_img:get(x, y))
            colB = color(map_img:get(x + 2, y))
            colC = color(map_img:get(x + 4, y))
            print(map_img:get(x, y))
            
            new[i + 1].links = colA.r
            new[i + 1].trans = colA.g
            new[i + 2].links = colA.b
            new[i + 2].trans = colA.a
            new[i + 3].links = colB.r
            new[i + 3].trans = colB.g
            new[i + 4].links = colB.b
            new[i + 4].trans = colB.a
            new[i + 5].links = colC.r
            new[i + 5].trans = colC.g
            new[i + 6].links = colC.b
            new[i + 6].trans = colC.a
        end
    end
    
    map = new
end
