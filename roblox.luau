--!nocheck
-- ============================================================
-- Roblox API 에뮬레이터 (순수 Luau)
-- server.js 가 사용자 코드 앞에 이 파일을 붙여서 실행합니다.
-- 실제 Roblox 엔진이 아니라 "흉내"를 내는 것이라 물리/렌더링/네트워크는 없어요.
-- ============================================================

local rawprint = print
local ERR_MARK = "\1RBX_ERR\2"
local NOTE_MARK = "\1RBX_NOTE\2"

local function emit(mark, msg)
	rawprint(mark .. (string.gsub(tostring(msg), "\n", "\3")))
end

local function joinArgs(...)
	local n = select("#", ...)
	local parts = {}
	for i = 1, n do
		parts[i] = tostring((select(i, ...)))
	end
	return table.concat(parts, " ")
end

-- Roblox 의 print 는 인자를 공백으로 이어 붙입니다.
print = function(...)
	rawprint(joinArgs(...))
end
warn = function(...)
	rawprint("[경고] " .. joinArgs(...))
end

math.randomseed(os.time())

-- ============================================================
-- 스케줄러 / task 라이브러리 (가상 시간: 실제로 기다리지 않고 시간을 건너뜁니다)
-- ============================================================
local FRAME = 1 / 60
local CAP = 120 -- 가상 시간 최대(초)
local now = 0
local seqn = 0
local timers = {}
local ready = {}

local function reportError(co, err)
	local tb = ""
	if co then
		local ok, t = pcall(debug.traceback, co)
		if ok and type(t) == "string" and t ~= "" then
			tb = "\n" .. t
		end
	end
	emit(ERR_MARK, tostring(err) .. tb)
end

local function step(co, ...)
	if coroutine.status(co) ~= "suspended" then
		return
	end
	local ok, err = coroutine.resume(co, ...)
	if not ok then
		reportError(co, err)
	end
end

local taskLib = {}

local function toThread(f)
	if type(f) == "thread" then
		return f
	end
	if type(f) ~= "function" then
		error("task 함수의 첫 번째 인자는 function 또는 thread 여야 합니다", 3)
	end
	return coroutine.create(f)
end

function taskLib.spawn(f, ...)
	local co = toThread(f)
	step(co, ...)
	return co
end

function taskLib.defer(f, ...)
	local co = toThread(f)
	table.insert(ready, { co, table.pack(...) })
	return co
end

function taskLib.delay(t, f, ...)
	local co = toThread(f)
	seqn += 1
	table.insert(timers, { t = now + math.max(tonumber(t) or 0, 0), seq = seqn, co = co, args = table.pack(...) })
	return co
end

function taskLib.wait(t)
	t = tonumber(t) or 0
	if t < FRAME then
		t = FRAME
	end
	if not coroutine.isyieldable() then
		error("task.wait 는 이 위치에서 사용할 수 없어요", 2)
	end
	seqn += 1
	table.insert(timers, { t = now + t, seq = seqn, co = coroutine.running(), wait = true, start = now })
	return coroutine.yield()
end

function taskLib.cancel(co)
	for i = #timers, 1, -1 do
		if timers[i].co == co then
			table.remove(timers, i)
		end
	end
	for i = #ready, 1, -1 do
		if ready[i][1] == co then
			table.remove(ready, i)
		end
	end
	pcall(coroutine.close, co)
end

function taskLib.synchronize() end
function taskLib.desynchronize() end

-- ============================================================
-- 시그널 (RBXScriptSignal / RBXScriptConnection)
-- ============================================================
local SignalMethods = {}
local SignalMT = { __type = "RBXScriptSignal", __index = SignalMethods }
local ConnMethods = {}
local ConnMT = { __type = "RBXScriptConnection", __index = ConnMethods }

local function newSignal()
	return setmetatable({ _c = {}, _w = {}, _n = 0 }, SignalMT)
end

function ConnMethods.Disconnect(self)
	if not self.Connected then
		return
	end
	self.Connected = false
	local sig = self._sig
	local i = table.find(sig._c, self)
	if i then
		table.remove(sig._c, i)
		sig._n -= 1
	end
end
ConnMethods.disconnect = ConnMethods.Disconnect

function SignalMethods.Connect(self, fn)
	if type(fn) ~= "function" then
		error("Attempt to connect failed: Passed value is not a function", 2)
	end
	local conn = setmetatable({ Connected = true, _fn = fn, _sig = self }, ConnMT)
	table.insert(self._c, conn)
	self._n += 1
	return conn
end
SignalMethods.connect = SignalMethods.Connect

function SignalMethods.Once(self, fn)
	local conn
	conn = self:Connect(function(...)
		if conn.Connected then
			conn:Disconnect()
			fn(...)
		end
	end)
	return conn
end

function SignalMethods.Wait(self)
	table.insert(self._w, coroutine.running())
	return coroutine.yield()
end
SignalMethods.wait = SignalMethods.Wait

local function fireSignal(sig, ...)
	if sig._n > 0 then
		local list = table.clone(sig._c)
		for _, conn in ipairs(list) do
			if conn.Connected then
				taskLib.spawn(conn._fn, ...)
			end
		end
	end
	if #sig._w > 0 then
		local ws = sig._w
		sig._w = {}
		local args = table.pack(...)
		for _, co in ipairs(ws) do
			table.insert(ready, { co, args })
		end
	end
end

local function clearSignal(sig)
	for _, c in ipairs(sig._c) do
		c.Connected = false
	end
	sig._c = {}
	sig._n = 0
	sig._w = {}
end

-- ============================================================
-- 데이터 타입: Vector3, Vector2, Color3, CFrame, TweenInfo, Random
-- ============================================================
local V3 = { __type = "Vector3" }
local V3M = {}
local function isV3(v)
	return type(v) == "table" and getmetatable(v) == V3
end
local function mkV3(x, y, z)
	return setmetatable({ X = x, Y = y, Z = z }, V3)
end
V3.__index = function(t, k)
	if k == "Magnitude" then
		return math.sqrt(t.X * t.X + t.Y * t.Y + t.Z * t.Z)
	end
	if k == "Unit" then
		local m = math.sqrt(t.X * t.X + t.Y * t.Y + t.Z * t.Z)
		if m == 0 then
			return t
		end
		return mkV3(t.X / m, t.Y / m, t.Z / m)
	end
	local f = V3M[k]
	if f then
		return f
	end
	error(tostring(k) .. " is not a valid member of Vector3", 2)
end
V3.__newindex = function(_, k)
	error("Unable to assign property " .. tostring(k) .. ". Vector3 는 읽기 전용이에요", 2)
end
V3.__add = function(a, b)
	if not (isV3(a) and isV3(b)) then
		error("Vector3 끼리만 더할 수 있어요", 2)
	end
	return mkV3(a.X + b.X, a.Y + b.Y, a.Z + b.Z)
end
V3.__sub = function(a, b)
	if not (isV3(a) and isV3(b)) then
		error("Vector3 끼리만 뺄 수 있어요", 2)
	end
	return mkV3(a.X - b.X, a.Y - b.Y, a.Z - b.Z)
end
V3.__mul = function(a, b)
	if type(a) == "number" then
		return mkV3(a * b.X, a * b.Y, a * b.Z)
	end
	if type(b) == "number" then
		return mkV3(a.X * b, a.Y * b, a.Z * b)
	end
	return mkV3(a.X * b.X, a.Y * b.Y, a.Z * b.Z)
end
V3.__div = function(a, b)
	if type(b) == "number" then
		return mkV3(a.X / b, a.Y / b, a.Z / b)
	end
	return mkV3(a.X / b.X, a.Y / b.Y, a.Z / b.Z)
end
V3.__unm = function(a)
	return mkV3(-a.X, -a.Y, -a.Z)
end
V3.__eq = function(a, b)
	return a.X == b.X and a.Y == b.Y and a.Z == b.Z
end
V3.__tostring = function(v)
	return string.format("%g, %g, %g", v.X, v.Y, v.Z)
end
function V3M.Dot(a, b)
	return a.X * b.X + a.Y * b.Y + a.Z * b.Z
end
function V3M.Cross(a, b)
	return mkV3(a.Y * b.Z - a.Z * b.Y, a.Z * b.X - a.X * b.Z, a.X * b.Y - a.Y * b.X)
end
function V3M.Lerp(a, b, t)
	return mkV3(a.X + (b.X - a.X) * t, a.Y + (b.Y - a.Y) * t, a.Z + (b.Z - a.Z) * t)
end
function V3M.FuzzyEq(a, b, eps)
	eps = eps or 1e-5
	return math.abs(a.X - b.X) <= eps and math.abs(a.Y - b.Y) <= eps and math.abs(a.Z - b.Z) <= eps
end
function V3M.Max(a, b)
	return mkV3(math.max(a.X, b.X), math.max(a.Y, b.Y), math.max(a.Z, b.Z))
end
function V3M.Min(a, b)
	return mkV3(math.min(a.X, b.X), math.min(a.Y, b.Y), math.min(a.Z, b.Z))
end

Vector3 = {
	new = function(x, y, z)
		return mkV3(x or 0, y or 0, z or 0)
	end,
	zero = mkV3(0, 0, 0),
	one = mkV3(1, 1, 1),
	xAxis = mkV3(1, 0, 0),
	yAxis = mkV3(0, 1, 0),
	zAxis = mkV3(0, 0, 1),
}

local V2 = { __type = "Vector2" }
local V2M = {}
local function mkV2(x, y)
	return setmetatable({ X = x, Y = y }, V2)
end
V2.__index = function(t, k)
	if k == "Magnitude" then
		return math.sqrt(t.X * t.X + t.Y * t.Y)
	end
	if k == "Unit" then
		local m = math.sqrt(t.X * t.X + t.Y * t.Y)
		if m == 0 then
			return t
		end
		return mkV2(t.X / m, t.Y / m)
	end
	local f = V2M[k]
	if f then
		return f
	end
	error(tostring(k) .. " is not a valid member of Vector2", 2)
end
V2.__add = function(a, b)
	return mkV2(a.X + b.X, a.Y + b.Y)
end
V2.__sub = function(a, b)
	return mkV2(a.X - b.X, a.Y - b.Y)
end
V2.__mul = function(a, b)
	if type(a) == "number" then
		return mkV2(a * b.X, a * b.Y)
	end
	if type(b) == "number" then
		return mkV2(a.X * b, a.Y * b)
	end
	return mkV2(a.X * b.X, a.Y * b.Y)
end
V2.__div = function(a, b)
	if type(b) == "number" then
		return mkV2(a.X / b, a.Y / b)
	end
	return mkV2(a.X / b.X, a.Y / b.Y)
end
V2.__unm = function(a)
	return mkV2(-a.X, -a.Y)
end
V2.__eq = function(a, b)
	return a.X == b.X and a.Y == b.Y
end
V2.__tostring = function(v)
	return string.format("%g, %g", v.X, v.Y)
end
function V2M.Dot(a, b)
	return a.X * b.X + a.Y * b.Y
end
function V2M.Lerp(a, b, t)
	return mkV2(a.X + (b.X - a.X) * t, a.Y + (b.Y - a.Y) * t)
end
Vector2 = {
	new = function(x, y)
		return mkV2(x or 0, y or 0)
	end,
	zero = mkV2(0, 0),
	one = mkV2(1, 1),
}

-- Color3
local C3 = { __type = "Color3" }
local C3M = {}
local function mkC3(r, g, b)
	return setmetatable({ R = r, G = g, B = b }, C3)
end
C3.__index = function(_, k)
	local f = C3M[k]
	if f then
		return f
	end
	error(tostring(k) .. " is not a valid member of Color3", 2)
end
C3.__eq = function(a, b)
	return a.R == b.R and a.G == b.G and a.B == b.B
end
C3.__tostring = function(c)
	return string.format("%g, %g, %g", c.R, c.G, c.B)
end
function C3M.Lerp(a, b, t)
	return mkC3(a.R + (b.R - a.R) * t, a.G + (b.G - a.G) * t, a.B + (b.B - a.B) * t)
end
function C3M.ToHex(c)
	return string.format(
		"%02x%02x%02x",
		math.floor(c.R * 255 + 0.5),
		math.floor(c.G * 255 + 0.5),
		math.floor(c.B * 255 + 0.5)
	)
end
function C3M.ToHSV(c)
	local mx = math.max(c.R, c.G, c.B)
	local mn = math.min(c.R, c.G, c.B)
	local d = mx - mn
	local h = 0
	if d ~= 0 then
		if mx == c.R then
			h = ((c.G - c.B) / d) % 6
		elseif mx == c.G then
			h = (c.B - c.R) / d + 2
		else
			h = (c.R - c.G) / d + 4
		end
		h = h / 6
	end
	local s = 0
	if mx ~= 0 then
		s = d / mx
	end
	return h, s, mx
end
Color3 = {
	new = function(r, g, b)
		return mkC3(r or 0, g or 0, b or 0)
	end,
	fromRGB = function(r, g, b)
		return mkC3((r or 0) / 255, (g or 0) / 255, (b or 0) / 255)
	end,
	fromHSV = function(h, s, v)
		local i = math.floor(h * 6)
		local f = h * 6 - i
		local p = v * (1 - s)
		local q = v * (1 - f * s)
		local t = v * (1 - (1 - f) * s)
		i = i % 6
		if i == 0 then
			return mkC3(v, t, p)
		elseif i == 1 then
			return mkC3(q, v, p)
		elseif i == 2 then
			return mkC3(p, v, t)
		elseif i == 3 then
			return mkC3(p, q, v)
		elseif i == 4 then
			return mkC3(t, p, v)
		end
		return mkC3(v, p, q)
	end,
	fromHex = function(hex)
		hex = string.gsub(tostring(hex), "#", "")
		local r = tonumber(string.sub(hex, 1, 2), 16)
		local g = tonumber(string.sub(hex, 3, 4), 16)
		local b = tonumber(string.sub(hex, 5, 6), 16)
		if not (r and g and b) then
			error("잘못된 hex 색상 값이에요", 2)
		end
		return mkC3(r / 255, g / 255, b / 255)
	end,
}

-- CFrame (3x3 회전 행렬 + 위치)
local CF = { __type = "CFrame" }
local CFM = {}
local IDENT = { 1, 0, 0, 0, 1, 0, 0, 0, 1 }
local function mkCF(x, y, z, m)
	return setmetatable({ X = x, Y = y, Z = z, _m = m or IDENT }, CF)
end
local function isCF(v)
	return type(v) == "table" and getmetatable(v) == CF
end
local function mm(a, b)
	local r = {}
	for i = 0, 2 do
		for j = 1, 3 do
			r[i * 3 + j] = a[i * 3 + 1] * b[j] + a[i * 3 + 2] * b[3 + j] + a[i * 3 + 3] * b[6 + j]
		end
	end
	return r
end
local function mv(m, x, y, z)
	return m[1] * x + m[2] * y + m[3] * z, m[4] * x + m[5] * y + m[6] * z, m[7] * x + m[8] * y + m[9] * z
end
local function transpose(m)
	return { m[1], m[4], m[7], m[2], m[5], m[8], m[3], m[6], m[9] }
end
CF.__index = function(t, k)
	if k == "Position" then
		return mkV3(t.X, t.Y, t.Z)
	end
	local m = t._m
	if k == "RightVector" then
		return mkV3(m[1], m[4], m[7])
	elseif k == "UpVector" then
		return mkV3(m[2], m[5], m[8])
	elseif k == "LookVector" then
		return mkV3(-m[3], -m[6], -m[9])
	end
	local f = CFM[k]
	if f then
		return f
	end
	error(tostring(k) .. " is not a valid member of CFrame", 2)
end
CF.__mul = function(a, b)
	if isCF(b) then
		local x, y, z = mv(a._m, b.X, b.Y, b.Z)
		return mkCF(x + a.X, y + a.Y, z + a.Z, mm(a._m, b._m))
	elseif isV3(b) then
		local x, y, z = mv(a._m, b.X, b.Y, b.Z)
		return mkV3(x + a.X, y + a.Y, z + a.Z)
	end
	error("CFrame 은 CFrame 또는 Vector3 와만 곱할 수 있어요", 2)
end
CF.__add = function(a, b)
	return mkCF(a.X + b.X, a.Y + b.Y, a.Z + b.Z, a._m)
end
CF.__sub = function(a, b)
	return mkCF(a.X - b.X, a.Y - b.Y, a.Z - b.Z, a._m)
end
CF.__eq = function(a, b)
	if a.X ~= b.X or a.Y ~= b.Y or a.Z ~= b.Z then
		return false
	end
	for i = 1, 9 do
		if a._m[i] ~= b._m[i] then
			return false
		end
	end
	return true
end
CF.__tostring = function(c)
	local m = c._m
	return string.format(
		"%g, %g, %g, %g, %g, %g, %g, %g, %g, %g, %g, %g",
		c.X, c.Y, c.Z, m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9]
	)
end
function CFM.Inverse(self)
	local mt = transpose(self._m)
	local x, y, z = mv(mt, -self.X, -self.Y, -self.Z)
	return mkCF(x, y, z, mt)
end
function CFM.ToWorldSpace(self, o)
	return self * o
end
function CFM.ToObjectSpace(self, o)
	return self:Inverse() * o
end
function CFM.PointToWorldSpace(self, v)
	return self * v
end
function CFM.PointToObjectSpace(self, v)
	return self:Inverse() * v
end
function CFM.VectorToWorldSpace(self, v)
	local x, y, z = mv(self._m, v.X, v.Y, v.Z)
	return mkV3(x, y, z)
end
function CFM.GetComponents(self)
	local m = self._m
	return self.X, self.Y, self.Z, m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9]
end

local function rotX(a)
	local c, s = math.cos(a), math.sin(a)
	return { 1, 0, 0, 0, c, -s, 0, s, c }
end
local function rotY(a)
	local c, s = math.cos(a), math.sin(a)
	return { c, 0, s, 0, 1, 0, -s, 0, c }
end
local function rotZ(a)
	local c, s = math.cos(a), math.sin(a)
	return { c, -s, 0, s, c, 0, 0, 0, 1 }
end

CFrame = {}
function CFrame.lookAt(at, target, up)
	up = up or mkV3(0, 1, 0)
	local look = (target - at)
	if look.Magnitude == 0 then
		return mkCF(at.X, at.Y, at.Z)
	end
	look = look.Unit
	local right = look:Cross(up)
	if right.Magnitude == 0 then
		right = mkV3(1, 0, 0)
	else
		right = right.Unit
	end
	local upv = right:Cross(look)
	local back = -look
	return mkCF(at.X, at.Y, at.Z, {
		right.X, upv.X, back.X,
		right.Y, upv.Y, back.Y,
		right.Z, upv.Z, back.Z,
	})
end
function CFrame.new(a, b, c)
	if a == nil then
		return mkCF(0, 0, 0)
	end
	if isV3(a) then
		if isV3(b) then
			return CFrame.lookAt(a, b)
		end
		return mkCF(a.X, a.Y, a.Z)
	end
	return mkCF(a, b or 0, c or 0)
end
function CFrame.Angles(rx, ry, rz)
	return mkCF(0, 0, 0, mm(mm(rotX(rx or 0), rotY(ry or 0)), rotZ(rz or 0)))
end
CFrame.fromEulerAnglesXYZ = CFrame.Angles
CFrame.identity = mkCF(0, 0, 0)

-- Enum
local EnumItemMT = { __type = "EnumItem" }
EnumItemMT.__tostring = function(i)
	return "Enum." .. i.EnumType._name .. "." .. i.Name
end
Enum = {}
local function defEnum(name, items)
	local e = { _name = name }
	setmetatable(e, {
		__type = "Enum",
		__tostring = function()
			return "Enum." .. name
		end,
		__index = function(_, k)
			error(tostring(k) .. " is not a valid EnumItem of Enum." .. name, 2)
		end,
	})
	for i, n in ipairs(items) do
		rawset(e, n, setmetatable({ Name = n, Value = i - 1, EnumType = e }, EnumItemMT))
	end
	Enum[name] = e
end
defEnum("Material", { "Plastic", "SmoothPlastic", "Wood", "WoodPlanks", "Metal", "Grass", "Neon", "Glass", "Brick", "Concrete", "Sand", "Ice", "Fabric", "Granite", "Marble", "Slate", "Cobblestone", "Foil" })
defEnum("PartType", { "Block", "Ball", "Cylinder", "Wedge", "CornerWedge" })
defEnum("NormalId", { "Right", "Top", "Back", "Left", "Bottom", "Front" })
defEnum("EasingStyle", { "Linear", "Sine", "Back", "Quad", "Quart", "Quint", "Bounce", "Elastic", "Exponential", "Circular", "Cubic" })
defEnum("EasingDirection", { "In", "Out", "InOut" })
defEnum("PlaybackState", { "Begin", "Delayed", "Playing", "Paused", "Completed", "Cancelled" })

local TweenInfoMT = { __type = "TweenInfo" }
TweenInfo = {
	new = function(time, style, dir, repeatCount, reverses, delayTime)
		return setmetatable({
			Time = time or 1,
			EasingStyle = style or Enum.EasingStyle.Quad,
			EasingDirection = dir or Enum.EasingDirection.Out,
			RepeatCount = repeatCount or 0,
			Reverses = reverses or false,
			DelayTime = delayTime or 0,
		}, TweenInfoMT)
	end,
}

-- Random
local RandomMT = { __type = "Random" }
RandomMT.__index = {
	NextNumber = function(self, a, b)
		self._s = (self._s * 16807) % 2147483647
		local r = (self._s - 1) / 2147483646
		if a then
			return a + r * ((b or 0) - a)
		end
		return r
	end,
	NextInteger = function(self, a, b)
		self._s = (self._s * 16807) % 2147483647
		local r = (self._s - 1) / 2147483646
		return math.floor(a + r * (b - a + 1))
	end,
}
Random = {
	new = function(seed)
		return setmetatable({ _s = math.floor(math.abs(seed or os.time())) % 2147483646 + 1 }, RandomMT)
	end,
}

-- ============================================================
-- JSON (HttpService 용)
-- ============================================================
local jsonEscapes = { ['"'] = '\\"', ["\\"] = "\\\\", ["\n"] = "\\n", ["\r"] = "\\r", ["\t"] = "\\t" }
local function jsonEncode(v)
	local t = type(v)
	if v == nil then
		return "null"
	elseif t == "boolean" then
		return tostring(v)
	elseif t == "number" then
		if v ~= v or v == math.huge or v == -math.huge then
			error("Can't convert an infinite or NaN number to JSON", 0)
		end
		return string.format("%.14g", v)
	elseif t == "string" then
		return '"' .. string.gsub(v, '[%c"\\]', function(c)
			return jsonEscapes[c] or string.format("\\u%04x", string.byte(c))
		end) .. '"'
	elseif t == "table" then
		local n = #v
		local count = 0
		for _ in pairs(v) do
			count += 1
		end
		local parts = {}
		if count == n then
			for i = 1, n do
				parts[i] = jsonEncode(v[i])
			end
			return "[" .. table.concat(parts, ",") .. "]"
		end
		for k, val in pairs(v) do
			if type(k) ~= "string" then
				error("Can't convert a table with non-string keys to JSON", 0)
			end
			table.insert(parts, jsonEncode(k) .. ":" .. jsonEncode(val))
		end
		return "{" .. table.concat(parts, ",") .. "}"
	end
	error("Can't convert a value of type " .. typeof(v) .. " to JSON", 0)
end

local function jsonDecode(s)
	local pos = 1
	local function skip()
		pos = string.find(s, "[^ \n\r\t]", pos) or (#s + 1)
	end
	local function fail(msg)
		error("Can't parse JSON: " .. msg .. " (위치 " .. pos .. ")", 0)
	end
	local simple = { n = "\n", t = "\t", r = "\r", b = "\b", f = "\f", ['"'] = '"', ["\\"] = "\\", ["/"] = "/" }
	local function parseString()
		local out = {}
		pos += 1
		while true do
			local c = string.sub(s, pos, pos)
			if c == "" then
				fail("문자열이 끝나지 않았어요")
			end
			if c == '"' then
				pos += 1
				break
			end
			if c == "\\" then
				local n = string.sub(s, pos + 1, pos + 1)
				if n == "u" then
					table.insert(out, utf8.char(tonumber(string.sub(s, pos + 2, pos + 5), 16) or 63))
					pos += 6
				else
					table.insert(out, simple[n] or n)
					pos += 2
				end
			else
				table.insert(out, c)
				pos += 1
			end
		end
		return table.concat(out)
	end
	local parseValue
	parseValue = function()
		skip()
		local c = string.sub(s, pos, pos)
		if c == "{" then
			pos += 1
			local obj = {}
			skip()
			if string.sub(s, pos, pos) == "}" then
				pos += 1
				return obj
			end
			while true do
				skip()
				if string.sub(s, pos, pos) ~= '"' then
					fail("객체의 키는 문자열이어야 해요")
				end
				local k = parseString()
				skip()
				if string.sub(s, pos, pos) ~= ":" then
					fail("':' 가 필요해요")
				end
				pos += 1
				obj[k] = parseValue()
				skip()
				local d = string.sub(s, pos, pos)
				pos += 1
				if d == "}" then
					break
				elseif d ~= "," then
					pos -= 1
					fail("',' 또는 '}' 가 필요해요")
				end
			end
			return obj
		elseif c == "[" then
			pos += 1
			local arr = {}
			local n = 0
			skip()
			if string.sub(s, pos, pos) == "]" then
				pos += 1
				return arr
			end
			while true do
				n += 1
				arr[n] = parseValue()
				skip()
				local d = string.sub(s, pos, pos)
				pos += 1
				if d == "]" then
					break
				elseif d ~= "," then
					pos -= 1
					fail("',' 또는 ']' 가 필요해요")
				end
			end
			return arr
		elseif c == '"' then
			return parseString()
		elseif string.sub(s, pos, pos + 3) == "true" then
			pos += 4
			return true
		elseif string.sub(s, pos, pos + 4) == "false" then
			pos += 5
			return false
		elseif string.sub(s, pos, pos + 3) == "null" then
			pos += 4
			return nil
		end
		local num = string.match(s, "^-?%d+%.?%d*[eE]?[+-]?%d*", pos)
		local value = num and tonumber(num)
		if not value then
			fail("알 수 없는 값이에요")
		end
		pos += #num
		return value
	end
	local result = parseValue()
	skip()
	if pos <= #s then
		fail("JSON 뒤에 불필요한 내용이 있어요")
	end
	return result
end

-- ============================================================
-- Instance 시스템
-- ============================================================
local S = {} -- instance -> 내부 상태
local NIL = {} -- "nil 값" 표시용
local classes = {}
local gameInst
local runService

local function defClass(name, superName, def)
	def = def or {}
	local c = {
		name = name,
		chain = { [name] = true },
		props = {},
		types = {},
		methods = {},
		events = {},
		getters = {},
		setters = {},
		creatable = def.creatable ~= false,
	}
	local super = superName and classes[superName]
	if super then
		for k in pairs(super.chain) do
			c.chain[k] = true
		end
		for _, field in ipairs({ "props", "types", "methods", "events", "getters", "setters" }) do
			for k, v in pairs(super[field]) do
				c[field][k] = v
			end
		end
		c.isValue = super.isValue
	end
	for k, v in pairs(def.props or {}) do
		c.props[k] = v
		c.types[k] = typeof(v)
	end
	for _, k in ipairs(def.nilprops or {}) do
		c.props[k] = NIL
		c.types[k] = "any"
	end
	for k, v in pairs(def.types or {}) do
		c.types[k] = v
	end
	for k, v in pairs(def.methods or {}) do
		c.methods[k] = v
	end
	for _, k in ipairs(def.events or {}) do
		c.events[k] = true
	end
	for k, v in pairs(def.getters or {}) do
		c.getters[k] = v
	end
	for k, v in pairs(def.setters or {}) do
		c.setters[k] = v
	end
	if def.isValue then
		c.isValue = true
	end
	classes[name] = c
	return c
end

local InstanceMT = { __type = "Instance" }

local function getFullName(inst)
	local parts = {}
	local cur = inst
	while cur do
		local st = S[cur]
		if st.class.name == "DataModel" then
			break
		end
		table.insert(parts, 1, st.props.Name)
		cur = st.parent
	end
	return table.concat(parts, ".")
end

local function getSignal(st, name)
	local sig = st.signals[name]
	if not sig then
		sig = newSignal()
		st.signals[name] = sig
	end
	return sig
end

local function fireEvent(inst, name, ...)
	local sig = S[inst].signals[name]
	if sig then
		fireSignal(sig, ...)
	end
end

local function fireAncestors(inst, name, ...)
	local cur = inst
	while cur do
		fireEvent(cur, name, ...)
		cur = S[cur].parent
	end
end

local function fireChanged(inst, st, key, value)
	if st.class.isValue and key == "Value" then
		fireEvent(inst, "Changed", value)
	else
		fireEvent(inst, "Changed", key)
	end
	local pcs = st.pcs[key]
	if pcs then
		fireSignal(pcs)
	end
end

local function collect(inst, out)
	for _, ch in ipairs(S[inst].children) do
		table.insert(out, ch)
		collect(ch, out)
	end
	return out
end

local function setParent(inst, newParent, lvl)
	local st = S[inst]
	if newParent ~= nil and not S[newParent] then
		error("Unable to assign property Parent. Object expected, got " .. typeof(newParent), lvl)
	end
	if st.parent == newParent then
		return
	end
	if st.locked then
		error(
			"The Parent property of " .. st.props.Name .. " is locked, current parent: "
				.. (st.parent and S[st.parent].props.Name or "NULL") .. ", new parent "
				.. (newParent and S[newParent].props.Name or "NULL"),
			lvl
		)
	end
	local a = newParent
	while a do
		if a == inst then
			error("Attempt to set " .. getFullName(inst) .. " as its own ancestor", lvl)
		end
		a = S[a].parent
	end
	local old = st.parent
	if old then
		fireAncestors(old, "DescendantRemoving", inst)
		local ps = S[old]
		local i = table.find(ps.children, inst)
		if i then
			table.remove(ps.children, i)
		end
		st.parent = nil
		fireEvent(old, "ChildRemoved", inst)
	end
	st.parent = newParent
	if newParent then
		table.insert(S[newParent].children, inst)
		fireEvent(newParent, "ChildAdded", inst)
		fireAncestors(newParent, "DescendantAdded", inst)
	end
	fireEvent(inst, "AncestryChanged", inst, newParent)
	fireChanged(inst, st, "Parent")
end

local function createInstance(className)
	local c = classes[className]
	local inst = setmetatable({}, InstanceMT)
	local st = {
		class = c,
		props = {},
		children = {},
		parent = nil,
		attrs = {},
		tags = {},
		signals = {},
		pcs = {},
		locked = false,
		destroyed = false,
	}
	for k, v in pairs(c.props) do
		st.props[k] = v
	end
	st.props.Name = className
	S[inst] = st
	return inst
end

local function destroyInst(inst)
	local st = S[inst]
	if st.destroyed then
		return
	end
	st.destroyed = true
	fireEvent(inst, "Destroying")
	for _, ch in ipairs(table.clone(st.children)) do
		destroyInst(ch)
	end
	st.locked = false
	setParent(inst, nil, 1)
	st.locked = true
	for _, sig in pairs(st.signals) do
		clearSignal(sig)
	end
	for _, sig in pairs(st.pcs) do
		clearSignal(sig)
	end
end

local function cloneInst(inst)
	local st = S[inst]
	if not st.props.Archivable then
		return nil
	end
	local copy = createInstance(st.class.name)
	local cst = S[copy]
	for k, v in pairs(st.props) do
		cst.props[k] = v
	end
	for k, v in pairs(st.attrs) do
		cst.attrs[k] = v
	end
	for k, v in pairs(st.tags) do
		cst.tags[k] = v
	end
	for _, ch in ipairs(st.children) do
		local cc = cloneInst(ch)
		if cc then
			setParent(cc, copy, 1)
		end
	end
	return copy
end

local function stOf(self, name)
	local st = S[self]
	if not st then
		error("Expected ':' not '.' calling member function " .. name, 3)
	end
	return st
end

local function memberError(inst, key)
	local st = S[inst]
	error(tostring(key) .. " is not a valid member of " .. st.class.name .. ' "' .. getFullName(inst) .. '"', 3)
end

InstanceMT.__tostring = function(inst)
	return S[inst].props.Name
end

InstanceMT.__index = function(inst, key)
	local st = S[inst]
	local c = st.class
	if key == "Parent" then
		return st.parent
	end
	if key == "ClassName" then
		return c.name
	end
	local g = c.getters[key]
	if g then
		return g(inst, st)
	end
	local v = st.props[key]
	if v ~= nil then
		if rawequal(v, NIL) then
			return nil
		end
		return v
	end
	local m = c.methods[key]
	if m then
		return m
	end
	if c.events[key] then
		return getSignal(st, key)
	end
	for _, ch in ipairs(st.children) do
		if S[ch].props.Name == key then
			return ch
		end
	end
	memberError(inst, key)
end

InstanceMT.__newindex = function(inst, key, value)
	local st = S[inst]
	local c = st.class
	if key == "Parent" then
		setParent(inst, value, 3)
		return
	end
	if key == "ClassName" then
		error("Unable to assign property ClassName. Property is read-only", 2)
	end
	local g = c.getters[key]
	local setter = c.setters[key]
	if st.props[key] == nil and not g then
		if c.methods[key] or c.events[key] then
			error("Unable to assign property " .. tostring(key) .. ". Property is read-only", 2)
		end
		memberError(inst, key)
	end
	if g and not setter and st.props[key] == nil then
		error("Unable to assign property " .. tostring(key) .. ". Property is read-only", 2)
	end
	local expected = c.types[key]
	if expected and expected ~= "any" and typeof(value) ~= expected then
		error(string.format("Unable to assign property %s. %s expected, got %s", tostring(key), expected, typeof(value)), 2)
	end
	local old
	if g then
		old = g(inst, st)
	else
		old = st.props[key]
		if rawequal(old, NIL) then
			old = nil
		end
	end
	if old == value then
		return
	end
	if setter then
		setter(inst, st, value)
	elseif value == nil then
		st.props[key] = NIL
	else
		st.props[key] = value
	end
	fireChanged(inst, st, key, value)
end

-- Instance 메서드
local IM = {}

function IM.GetChildren(self)
	return table.clone(stOf(self, "GetChildren").children)
end
function IM.GetDescendants(self)
	stOf(self, "GetDescendants")
	return collect(self, {})
end
function IM.IsA(self, className)
	return stOf(self, "IsA").class.chain[className] == true
end
function IM.FindFirstChild(self, name, recursive)
	local st = stOf(self, "FindFirstChild")
	for _, ch in ipairs(st.children) do
		if S[ch].props.Name == name then
			return ch
		end
	end
	if recursive then
		for _, d in ipairs(collect(self, {})) do
			if S[d].props.Name == name then
				return d
			end
		end
	end
	return nil
end
function IM.FindFirstChildOfClass(self, className)
	for _, ch in ipairs(stOf(self, "FindFirstChildOfClass").children) do
		if S[ch].class.name == className then
			return ch
		end
	end
	return nil
end
function IM.FindFirstChildWhichIsA(self, className, recursive)
	local st = stOf(self, "FindFirstChildWhichIsA")
	for _, ch in ipairs(st.children) do
		if S[ch].class.chain[className] then
			return ch
		end
	end
	if recursive then
		for _, d in ipairs(collect(self, {})) do
			if S[d].class.chain[className] then
				return d
			end
		end
	end
	return nil
end
function IM.FindFirstAncestor(self, name)
	local cur = stOf(self, "FindFirstAncestor").parent
	while cur do
		if S[cur].props.Name == name then
			return cur
		end
		cur = S[cur].parent
	end
	return nil
end
function IM.FindFirstAncestorOfClass(self, className)
	local cur = stOf(self, "FindFirstAncestorOfClass").parent
	while cur do
		if S[cur].class.name == className then
			return cur
		end
		cur = S[cur].parent
	end
	return nil
end
function IM.FindFirstAncestorWhichIsA(self, className)
	local cur = stOf(self, "FindFirstAncestorWhichIsA").parent
	while cur do
		if S[cur].class.chain[className] then
			return cur
		end
		cur = S[cur].parent
	end
	return nil
end
function IM.IsDescendantOf(self, ancestor)
	local cur = stOf(self, "IsDescendantOf").parent
	while cur do
		if cur == ancestor then
			return true
		end
		cur = S[cur].parent
	end
	return false
end
function IM.IsAncestorOf(self, descendant)
	return descendant:IsDescendantOf(self)
end
function IM.GetFullName(self)
	stOf(self, "GetFullName")
	return getFullName(self)
end
function IM.Clone(self)
	stOf(self, "Clone")
	return cloneInst(self)
end
function IM.Destroy(self)
	stOf(self, "Destroy")
	destroyInst(self)
end
IM.Remove = IM.Destroy
function IM.ClearAllChildren(self)
	for _, ch in ipairs(table.clone(stOf(self, "ClearAllChildren").children)) do
		destroyInst(ch)
	end
end
function IM.WaitForChild(self, name, timeout)
	local found = self:FindFirstChild(name)
	if found then
		return found
	end
	if not coroutine.isyieldable() then
		error("WaitForChild: 이 위치에서는 기다릴 수 없어요", 2)
	end
	local co = coroutine.running()
	local done = false
	local conn
	local path = getFullName(self)
	conn = self.ChildAdded:Connect(function(c)
		if not done and S[c].props.Name == name then
			done = true
			conn:Disconnect()
			table.insert(ready, { co, table.pack(c) })
		end
	end)
	if timeout then
		taskLib.delay(timeout, function()
			if not done then
				done = true
				conn:Disconnect()
				table.insert(ready, { co, table.pack(nil) })
			end
		end)
	else
		taskLib.delay(5, function()
			if not done then
				rawprint("[경고] Infinite yield possible on '" .. path .. ':WaitForChild("' .. tostring(name) .. "\")'")
			end
		end)
	end
	return coroutine.yield()
end
function IM.SetAttribute(self, name, value)
	local st = stOf(self, "SetAttribute")
	if st.attrs[name] ~= value then
		st.attrs[name] = value
		fireEvent(self, "AttributeChanged", name)
	end
end
function IM.GetAttribute(self, name)
	return stOf(self, "GetAttribute").attrs[name]
end
function IM.GetAttributes(self)
	local out = {}
	for k, v in pairs(stOf(self, "GetAttributes").attrs) do
		out[k] = v
	end
	return out
end
function IM.AddTag(self, tag)
	stOf(self, "AddTag").tags[tag] = true
end
function IM.RemoveTag(self, tag)
	stOf(self, "RemoveTag").tags[tag] = nil
end
function IM.HasTag(self, tag)
	return stOf(self, "HasTag").tags[tag] == true
end
function IM.GetTags(self)
	local out = {}
	for k in pairs(stOf(self, "GetTags").tags) do
		table.insert(out, k)
	end
	return out
end
function IM.GetPropertyChangedSignal(self, prop)
	local st = stOf(self, "GetPropertyChangedSignal")
	if prop ~= "Parent" and st.props[prop] == nil and not st.class.getters[prop] then
		error(tostring(prop) .. " is not a valid property name.", 2)
	end
	local sig = st.pcs[prop]
	if not sig then
		sig = newSignal()
		st.pcs[prop] = sig
	end
	return sig
end

defClass("Instance", nil, {
	creatable = false,
	props = { Name = "Instance", Archivable = true },
	events = { "Changed", "ChildAdded", "ChildRemoved", "DescendantAdded", "DescendantRemoving", "Destroying", "AncestryChanged", "AttributeChanged" },
	methods = IM,
})

-- ---------- 일반 클래스 ----------
defClass("PVInstance", "Instance", { creatable = false })
defClass("BasePart", "PVInstance", {
	creatable = false,
	props = {
		CFrame = mkCF(0, 0, 0),
		Size = mkV3(4, 1, 2),
		Anchored = false,
		CanCollide = true,
		CanTouch = true,
		CanQuery = true,
		Massless = false,
		Locked = false,
		Transparency = 0,
		Reflectance = 0,
		Color = Color3.fromRGB(163, 162, 165),
		Material = Enum.Material.Plastic,
	},
	events = { "Touched", "TouchEnded" },
	types = { Position = "Vector3" },
	getters = {
		Position = function(_, st)
			local c = st.props.CFrame
			return mkV3(c.X, c.Y, c.Z)
		end,
	},
	setters = {
		Position = function(inst, st, v)
			local c = st.props.CFrame
			st.props.CFrame = mkCF(v.X, v.Y, v.Z, c._m)
			fireChanged(inst, st, "CFrame")
		end,
	},
})
defClass("Part", "BasePart", { props = { Shape = Enum.PartType.Block } })

local function modelPivot(self)
	local pp = S[self].props.PrimaryPart
	if pp ~= nil and not rawequal(pp, NIL) then
		return pp.CFrame
	end
	for _, d in ipairs(collect(self, {})) do
		if S[d].class.chain.BasePart then
			return d.CFrame
		end
	end
	return CFrame.new()
end
local modelMethods = {
	GetPivot = function(self)
		return modelPivot(self)
	end,
	PivotTo = function(self, target)
		local delta = target * modelPivot(self):Inverse()
		for _, d in ipairs(collect(self, {})) do
			if S[d].class.chain.BasePart then
				d.CFrame = delta * d.CFrame
			end
		end
	end,
	MoveTo = function(self, pos)
		local delta = pos - modelPivot(self).Position
		for _, d in ipairs(collect(self, {})) do
			if S[d].class.chain.BasePart then
				d.CFrame = d.CFrame + delta
			end
		end
	end,
}
defClass("Model", "PVInstance", { nilprops = { "PrimaryPart" }, methods = modelMethods })
defClass("Folder", "Instance")
defClass("Configuration", "Instance")
defClass("Script", "Instance", { props = { Enabled = true } })
defClass("LocalScript", "Instance", { props = { Enabled = true } })
defClass("ModuleScript", "Instance")

defClass("Humanoid", "Instance", {
	props = {
		Health = 100,
		MaxHealth = 100,
		WalkSpeed = 16,
		JumpPower = 50,
		JumpHeight = 7.2,
		HipHeight = 2,
		DisplayName = "",
		Jump = false,
		Sit = false,
	},
	events = { "Died", "HealthChanged" },
	methods = {
		TakeDamage = function(self, amount)
			self.Health = self.Health - amount
		end,
	},
	setters = {
		Health = function(inst, st, v)
			local old = st.props.Health
			local nv = math.clamp(v, 0, st.props.MaxHealth)
			st.props.Health = nv
			if nv ~= old then
				fireEvent(inst, "HealthChanged", nv)
				if nv <= 0 and old > 0 then
					fireEvent(inst, "Died")
				end
			end
		end,
	},
})

defClass("ValueBase", "Instance", { creatable = false, isValue = true })
defClass("StringValue", "ValueBase", { props = { Value = "" } })
defClass("IntValue", "ValueBase", { props = { Value = 0 } })
defClass("NumberValue", "ValueBase", { props = { Value = 0 } })
defClass("BoolValue", "ValueBase", { props = { Value = false } })
defClass("Vector3Value", "ValueBase", { props = { Value = mkV3(0, 0, 0) } })
defClass("Color3Value", "ValueBase", { props = { Value = mkC3(0, 0, 0) } })
defClass("ObjectValue", "ValueBase", { nilprops = { "Value" } })

defClass("BindableEvent", "Instance", {
	events = { "Event" },
	methods = {
		Fire = function(self, ...)
			fireEvent(self, "Event", ...)
		end,
	},
})
defClass("BindableFunction", "Instance", {
	nilprops = { "OnInvoke" },
	methods = {
		Invoke = function(self, ...)
			local f = S[self].props.OnInvoke
			if f == nil or rawequal(f, NIL) then
				return nil
			end
			return f(...)
		end,
	},
})
defClass("RemoteEvent", "Instance", {
	events = { "OnServerEvent", "OnClientEvent" },
	methods = {
		FireClient = function() end,
		FireAllClients = function() end,
		FireServer = function() end,
	},
})
defClass("RemoteFunction", "Instance", { nilprops = { "OnServerInvoke" } })

-- ---------- 서비스 ----------
defClass("DataModel", "Instance", {
	creatable = false,
	props = { PlaceId = 0, GameId = 0, JobId = "" },
	methods = {
		GetService = function(self, name)
			for _, ch in ipairs(S[self].children) do
				if S[ch].class.name == name then
					return ch
				end
			end
			error("'" .. tostring(name) .. "' is not a valid Service name (이 샌드박스에서 지원하지 않는 서비스일 수 있어요)", 2)
		end,
		FindService = function(self, name)
			for _, ch in ipairs(S[self].children) do
				if S[ch].class.name == name then
					return ch
				end
			end
			return nil
		end,
	},
})

defClass("Workspace", "Model", {
	creatable = false,
	props = { Gravity = 196.2, FallenPartsDestroyHeight = -500 },
	nilprops = { "CurrentCamera" },
	methods = {
		GetServerTimeNow = function()
			return os.time() + now
		end,
	},
})
defClass("Players", "Instance", {
	creatable = false,
	nilprops = { "LocalPlayer" },
	events = { "PlayerAdded", "PlayerRemoving" },
	methods = {
		GetPlayers = function()
			return {}
		end,
		GetPlayerByUserId = function()
			return nil
		end,
		GetPlayerFromCharacter = function()
			return nil
		end,
	},
})
defClass("ReplicatedStorage", "Instance", { creatable = false })
defClass("ServerStorage", "Instance", { creatable = false })
defClass("ServerScriptService", "Instance", { creatable = false })
defClass("Lighting", "Instance", {
	creatable = false,
	props = { ClockTime = 14, Brightness = 2, GlobalShadows = true, FogEnd = 100000, TimeOfDay = "14:00:00" },
})
defClass("RunService", "Instance", {
	creatable = false,
	events = { "Heartbeat", "Stepped", "RenderStepped", "PreSimulation", "PostSimulation" },
	methods = {
		IsServer = function()
			return true
		end,
		IsClient = function()
			return false
		end,
		IsStudio = function()
			return false
		end,
		IsRunning = function()
			return true
		end,
		IsEdit = function()
			return false
		end,
	},
})

local function notEnabled()
	error("Http requests are not enabled. 이 샌드박스는 외부 네트워크 요청을 지원하지 않아요", 2)
end
defClass("HttpService", "Instance", {
	creatable = false,
	props = { HttpEnabled = false },
	methods = {
		GenerateGUID = function(_, wrap)
			local g = string.gsub("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx", "[xy]", function(c)
				local v = (c == "x") and math.random(0, 15) or math.random(8, 11)
				return string.format("%X", v)
			end)
			if wrap == false then
				return g
			end
			return "{" .. g .. "}"
		end,
		JSONEncode = function(_, v)
			return jsonEncode(v)
		end,
		JSONDecode = function(_, s)
			if type(s) ~= "string" then
				error("JSONDecode 는 문자열이 필요해요", 2)
			end
			return jsonDecode(s)
		end,
		GetAsync = notEnabled,
		PostAsync = notEnabled,
		RequestAsync = notEnabled,
	},
})
defClass("CollectionService", "Instance", {
	creatable = false,
	methods = {
		AddTag = function(_, inst, tag)
			inst:AddTag(tag)
		end,
		RemoveTag = function(_, inst, tag)
			inst:RemoveTag(tag)
		end,
		HasTag = function(_, inst, tag)
			return inst:HasTag(tag)
		end,
		GetTags = function(_, inst)
			return inst:GetTags()
		end,
		GetTagged = function(_, tag)
			local out = {}
			for _, d in ipairs(collect(gameInst, {})) do
				if S[d].tags[tag] then
					table.insert(out, d)
				end
			end
			return out
		end,
	},
})
defClass("Debris", "Instance", {
	creatable = false,
	methods = {
		AddItem = function(_, item, lifetime)
			taskLib.delay(lifetime or 10, function()
				if S[item] and not S[item].destroyed then
					destroyInst(item)
				end
			end)
		end,
	},
})

-- TweenService
local function easeValue(style, dir, t)
	local sname = style.Name
	if sname == "Linear" then
		return t
	end
	local function f(x)
		if sname == "Quad" then
			return x * x
		elseif sname == "Cubic" then
			return x * x * x
		elseif sname == "Sine" then
			return 1 - math.cos(x * math.pi / 2)
		end
		return x * x
	end
	local d = dir.Name
	if d == "In" then
		return f(t)
	elseif d == "Out" then
		return 1 - f(1 - t)
	end
	if t < 0.5 then
		return f(t * 2) / 2
	end
	return 1 - f((1 - t) * 2) / 2
end
local function lerpValue(a, b, t)
	local ty = typeof(a)
	if ty == "number" then
		return a + (b - a) * t
	elseif ty == "Vector3" or ty == "Color3" then
		return a:Lerp(b, t)
	elseif ty == "CFrame" then
		local p = a.Position:Lerp(b.Position, t)
		return mkCF(p.X, p.Y, p.Z, (t >= 1) and b._m or a._m)
	end
	if t >= 1 then
		return b
	end
	return a
end
local TweenMT = { __type = "Tween" }
TweenMT.__index = {
	Play = function(self)
		if self._playing then
			return
		end
		self._playing = true
		local info = self._info
		taskLib.spawn(function()
			local startVals = {}
			for k in pairs(self._goals) do
				startVals[k] = self._inst[k]
			end
			if info.DelayTime > 0 then
				taskLib.wait(info.DelayTime)
			end
			local t0 = now
			local dur = info.Time
			while self._playing do
				local alpha = 1
				if dur > 0 then
					alpha = math.min((now - t0) / dur, 1)
				end
				local e = easeValue(info.EasingStyle, info.EasingDirection, alpha)
				for k, goal in pairs(self._goals) do
					self._inst[k] = lerpValue(startVals[k], goal, (alpha >= 1) and 1 or e)
				end
				if alpha >= 1 then
					break
				end
				taskLib.wait()
			end
			if self._playing then
				self._playing = false
				fireSignal(self.Completed, Enum.PlaybackState.Completed)
			end
		end)
	end,
	Cancel = function(self)
		if self._playing then
			self._playing = false
			fireSignal(self.Completed, Enum.PlaybackState.Cancelled)
		end
	end,
}
TweenMT.__index.Pause = TweenMT.__index.Cancel
defClass("TweenService", "Instance", {
	creatable = false,
	methods = {
		Create = function(_, inst, info, goals)
			if not S[inst] then
				error("TweenService:Create 의 첫 번째 인자는 Instance 여야 해요", 2)
			end
			if typeof(info) ~= "TweenInfo" then
				error("TweenService:Create 의 두 번째 인자는 TweenInfo 여야 해요", 2)
			end
			return setmetatable({ _inst = inst, _info = info, _goals = goals, _playing = false, Completed = newSignal() }, TweenMT)
		end,
	},
})

-- ---------- 인스턴스 생성 API ----------
local InstanceLib = {
	new = function(className, parent)
		local c = type(className) == "string" and classes[className] or nil
		if not c or not c.creatable then
			error('Unable to create an Instance of type "' .. tostring(className) .. '"', 2)
		end
		local inst = createInstance(className)
		if parent ~= nil then
			setParent(inst, parent, 3)
		end
		return inst
	end,
}

-- ---------- 게임 트리 구성 ----------
gameInst = createInstance("DataModel")
S[gameInst].props.Name = "Game"
for _, name in ipairs({ "Workspace", "Players", "Lighting", "ReplicatedStorage", "ServerStorage", "ServerScriptService", "RunService", "HttpService", "CollectionService", "Debris", "TweenService" }) do
	local s = createInstance(name)
	setParent(s, gameInst, 1)
	S[s].locked = true
	if name == "RunService" then
		runService = s
	end
end
local scriptInst = createInstance("Script")
setParent(scriptInst, gameInst:GetService("ServerScriptService"), 1)

-- ============================================================
-- 스케줄러 실행
-- ============================================================
local frameSignalNames = { "PreSimulation", "Stepped", "Heartbeat", "PostSimulation", "RenderStepped" }

local function frameListeners()
	local rs = S[runService].signals
	local n = 0
	for _, name in ipairs(frameSignalNames) do
		local sig = rs[name]
		if sig then
			n += sig._n + #sig._w
		end
	end
	return n
end

local function fireFrame(dt)
	local rs = S[runService].signals
	if rs.PreSimulation then
		fireSignal(rs.PreSimulation, dt)
	end
	if rs.Stepped then
		fireSignal(rs.Stepped, now, dt)
	end
	if rs.Heartbeat then
		fireSignal(rs.Heartbeat, dt)
	end
	if rs.PostSimulation then
		fireSignal(rs.PostSimulation, dt)
	end
	if rs.RenderStepped then
		fireSignal(rs.RenderStepped, dt)
	end
end

local function runDueTimers()
	local due = {}
	for i = #timers, 1, -1 do
		if timers[i].t <= now + 1e-9 then
			table.insert(due, table.remove(timers, i))
		end
	end
	table.sort(due, function(a, b)
		if a.t ~= b.t then
			return a.t < b.t
		end
		return a.seq < b.seq
	end)
	for _, e in ipairs(due) do
		if coroutine.status(e.co) == "suspended" then
			if e.wait then
				step(e.co, now - e.start)
			else
				step(e.co, table.unpack(e.args, 1, e.args.n))
			end
		end
	end
end

function __rbx_main(f)
	taskLib.spawn(f)
end

function __rbx_run()
	local t0 = os.clock()
	while true do
		if #ready > 0 then
			local batch = ready
			ready = {}
			for _, item in ipairs(batch) do
				step(item[1], table.unpack(item[2], 1, item[2].n))
			end
		else
			local frames = frameListeners()
			local nextT = math.huge
			for _, e in ipairs(timers) do
				if e.t < nextT then
					nextT = e.t
				end
			end
			if frames > 0 then
				now += FRAME
				fireFrame(FRAME)
			elseif nextT < math.huge then
				if nextT > now then
					now = nextT
				end
			else
				break
			end
			if now > CAP then
				emit(NOTE_MARK, "가상 시간이 " .. CAP .. "초를 넘어서 실행을 마쳤어요. (무한 루프/Heartbeat 보호)")
				break
			end
			runDueTimers()
		end
		if os.clock() - t0 > 4 then
			emit(NOTE_MARK, "실행 시간이 4초를 넘어서 중단했어요.")
			break
		end
	end
end

-- ============================================================
-- 전역 등록
-- ============================================================
task = taskLib
game = gameInst
workspace = gameInst:GetService("Workspace")
script = scriptInst
Instance = InstanceLib

wait = function(t)
	local e = taskLib.wait(t)
	return e, now
end
spawn = function(f, ...)
	return taskLib.delay(0, f, ...)
end
delay = function(t, f, ...)
	return taskLib.delay(t, f, ...)
end
tick = function()
	return os.time() + now
end
time = function()
	return now
end
elapsedTime = time
if unpack == nil then
	unpack = table.unpack
end

local function strsplit(s, sep)
	sep = sep or ","
	local out = {}
	if sep == "" then
		for i = 1, #s do
			out[i] = string.sub(s, i, i)
		end
		return out
	end
	local p = 1
	while true do
		local a, b = string.find(s, sep, p, true)
		if not a then
			table.insert(out, string.sub(s, p))
			break
		end
		table.insert(out, string.sub(s, p, a - 1))
		p = b + 1
	end
	return out
end
if string.split == nil then
	local ok = pcall(function()
		string.split = strsplit
	end)
	if not ok then
		string = setmetatable({ split = strsplit }, { __index = string })
	end
end
