# pubg-minimap-replay
https://github.com/Web-Engine/pubg-minimap-replay
이 레포지토리는 정해진 `포맷된 데이터`를 재생하는 라이브러리입니다.

## Data format
저희가 정한 포맷은 JSON을 기반으로 하였으며 다음과 같습니다.

### Data Types
|type|example|description|
|-|-|-|
|string|"test"|문자열|
|integer|123|정수형|
|number|1.23|실수형|
|boolean|true|논리형|
|color|0|0 이상 0xFFFFFF 이하의 정수값입니다.|
|AssetID|"AssetPath"|문자열로 표현되며 AssetList 안에 Key로 반드시 존재해야 합니다.

### ReplayData
리플레이 파일의 전체 구조입니다.

```
{
    // 이 리플레이에 활용한 Asset의 목록 (배열이 아닌 key-value object 형태)
    "assets": AssetList,
    
    // 게임의 전반적인 정보를 저장
    "game": GameInformation,
    
    // 리플레이를 재생할 캔버스 설정
    "canvas": CanvasSettings,

    // 플레이어나 중립 몬스터등 살아있는 생명체를 표현
    "characters": [
        GameCharacter,
        GameCharacter,
        GameCharacter,
        ...
    ],
    
    // 미니맵에 표시되는 일반 객체
    "objects": [
        GameObject,
        GameObject,
        GameObject,
        ...
    ],
    
    // 미니맵에 표시할 UI
    "ui": [
        GameUI, 
        GameUI, 
        GameUI,
        ...
    ],

    // 캐릭터들이 공격하는 것을 표현
    "attacks": [
        GameAttack,
        GameAttack,
        GameAttack,
        ...
    ],
}
```

### AssetList
리플레이에 필요한 여러 이미지 에셋들을 담고 있습니다.
이미지 에셋은 웹 경로나 base64로 인코딩된 이미지를 넣을 수 있습니다.

```
{
    "Asset-ID-1": "Asset1 path",
    "Asset-ID-2": "Asset2 path",
    "Asset-ID-3": "Asset3 path",
    ...
}
```

### GameInformation
게임의 전체적인 정보를 저장하고 있습니다.

```
{
    // 게임 내에서 맵 가로 크기
    "width": number,

    // 게임 내에서의 맵 세로 크기
    "height": number,

    // 배경에 대한 정보
    "background": {
        // 배경 이미지의 AssetID
        "image": AssetID, 
    },

    // 게임 총 진행 시간 (단위: ms)
    "duration": number
}
```

### CanvasSettings
리플레이를 재생하는 캔버스에 대한 설정입니다.

```
{
    // 리플레이를 보여줄 캔버스의 가로 크기
    "width": integer, 

    // 리플레이를 보여줄 캔버스의 세로 크기
    "height": integer
}
```

### GameCharacter
플레이어나 중립 몬스터등 살아있는 생명체를 표현할 때 사용합니다.

```
{
    // 캐릭터를 구분할 아이디
    "id": string,

    // 캐릭터가 표시될 이름, 마우스를 올리면 툴팁으로 이름이 표시됩니다.
    "name": string,

    // 시간에 따른 캐릭터 위치 정보
    "locations": [ 
        LiveGameLocation,
        LiveGameLocation,
        LiveGameLocation,
        ...
    ],

    // 시간에 따른 캐릭터 모양 정보
    "shapes": [
        LiveShape,
        LiveShape,
        LiveShape,
        ...
    ]
}
```

### GameObject
미니맵에 표시되는 일반 객체입니다.
배틀그라운드의 레드존, 자기장(파란 원), 안전 지역(흰색 원), 보급상자 등을 표시할 때 활용 할 수 있습니다.

```
{
    // 시간에 따른 객체 위치 정보
    "locations": [
        LiveGameLocation,
        LiveGameLocation,
        LiveGameLocation,
        ...
    ],

    // 시간에 따른 객체 모양 정보
    "shapes": [
        LiveShape,
        LiveShape,
        LiveShape,
        ...
    ],

    // 객체에 마우스 오버시 툴팁으로 표시할 내용 (해당 객체 클릭시 툴팁이 고정됨)
    "tooltips": [
        LiveTooltip,
        LiveTooltip,
        LiveTooltip,
        ...
    ],
}
```

### GameUI
미니맵에 표시할 UI를 정의합니다.
배틀 그라운드의 살아있는 사람 수, 혹은 리그오브레전드의 킬 스코어 현황 등을 표시할 때 활용 할 수 있습니다.

```
{
    // 시간에 따른 UI의 위치
    "positions": [
        LivePosition,
        LivePosition,
        LivePosition,
        ...
    ],

    // 시간에 따른 UI의 모양
    "shapes": [
        LiveShape,
        LiveShape,
        LiveShape,
        ...
    ],

    // 시간에 따른 UI 내 글씨
    "texts": [
        LiveText,
        LiveText,
        LiveText,
        ...
    ],
}
```

### GameAttack
캐릭터들이 공격하는 것을 표현합니다.
```
LineAttack | BulletAttack
```

### LineAttack
공격 시작 지점에서 공격 대상 지점으로 선 모양으로 그려지는 공격입니다.

```
{
    // 선 모양 Attack
    "type": "line",

    // 공격 시작 지점
    "attacker": GameLocation,

    // 공격 대상 지점
    "target": GameLocation,

    // 공격 선 모양 정의
    "shape": {
        // 선 두께
        "lineWidth": number,

        // 선 색상
        "lineColor": color,

        // 선 
        "lineAlpha": number,
    },
    // 공격이 진행되는 시간 (단위: 게임 내의 시간 ms)
    "duration": number,

    // 위 duration을 게임 내의 시간이 아닌 리플레이 시 보여지는 시간으로 사용
    "fixDuration": boolean,

    // 현재 정보에 해당하는 게임 시간 (단위: ms) 
    "elapsedTime": number
}
```

### BulletAttack
```
{
    // 총알 형태 Attack
    "type": "bullet",

    // 공격 시작 지점
    "attacker": GameLocation,

    // 공격 대상 지점
    "target": GameLocation,

    // 총알 모양 정의
    "shape": Shape,

    // 공격이 진행되는 시간 (단위: 게임 내의 시간 ms)
    "duration": number,

    // 위 duration을 게임 내의 시간이 아닌 리플레이 시 보여지는 시간으로 사용
    "fixDuration": boolean,

    // 현재 정보에 해당하는 게임 시간 (단위: ms) 
    "elapsedTime": number
}
```

### LiveGameLocation
게임 시간, 보간 정보를 포함한 게임 맵 기준 좌표 정보입니다.

```
{
    // 게임을 시작한지 elapsedTime만큼 지났을 때의 좌표
    ...GameLocation,

    // 이전 좌표와 현재 좌표 사이의 좌표를 보간해서 사용 할 지 여부
    "transition": boolean,

    // 현재 좌표에 해당하는 게임 시간 (단위: ms) 
    "elapsedTime": number
}
```

### GameLocation
게임 맵 크기를 기준으로 한 특정 좌표를 의미합니다.

```
{
    // 게임 맵 크기 기준 x좌표
    "x": number,

    // 게임 맵 크기 기준 y좌표
    "y": number 
}
```

### LivePosition
게임 시간, 보간 정보를 포함한 캔버스 기준 좌표 정보입니다.

```
{
    // 게임을 시작한지 elapsedTime만큼 지났을 때의 좌표
    ...Position,

    // 이전 좌표와 현재 좌표 사이의 좌표를 보간해서 사용 할 지 여부
    "transition": boolean,

    // 현재 좌표에 해당하는 게임 시간 (단위: ms) 
    "elapsedTime": number
}
```

### Position
캔버스 크기를 기준으로 한 특정 좌표를 의미합니다.

```
{
    // 캔버스 크기 기준 x좌표
    "x": number,

    // 캔버스 크기 기준 y좌표
    "y": number
}
```

### LiveTooltip
게임 시간을 포함한 툴팁 정보입니다.

```
{
    // 툴팁으로 표시할 글씨
    "text": string,
    
    // 현재 툴팁에 해당하는 게임 시간 (단위: ms)
    "elapsedTime": number, 
}
```

### LiveText
게임 시간을 포함한 글씨 정보입니다.

```
{
    // 글씨 내용
    "text": string,

    // 글씨 색
    "textColor": color,

    // 글씨 투명도
    "textAlpha": number,

    // 글씨 크기
    "textSize": number,

    // 현재 글씨에 해당하는 게임 시간 (단위: ms)
    "elapsedTime": number,
}
```

### LiveShape
게임 시간, 보간 정보를 포함한 모양 정보입니다.

```
{
    // 게임을 시작한지 elapsedTime만큼 지났을 때의 캐릭터 모양 정보
    ...Shape,

    // 이전 모양 정보와 현재 모양 정보 사이의 모양를 보간해서 사용 할 지 여부
    // - 서로 다른 Shape 사이에서는 보간이 되지 않음
    // - Shape의 fillColor, lineColor는 보간이 되지 않음
    "transition": boolean,

    // 현재 모양 정보에 해당하는 게임 시간 (단위: ms)
    "elapsedTime": number   
}
```

### Shape

```
RectangleShape | EllipseShape | ImageShape
```

### RectangleShape
직사각형 형태의 Shape입니다.

```
{
    // 직사각형 모양 Shape
    "type": "rectangle",

    // 가로 크기 (게임 맵 크기 기준)
    "width": number,

    // 세로 크기 (게임 맵 크기 기준)
    "height": number,

    // width과 height를 게임 맵 크기 기준이 아닌 캔버스 크기를 기준으로 사용
    "fixSize": boolean,

    // 배경 색상
    "fillColor": color, 

    // 배경 투명도
    "fillAlpha": number, 

    // 테두리 색상
    "lineColor": color, 

    // 테두리 투명도
    "lineAlpha": number,

    // 테두리 두께
    "lineWidth": number,
}
```

### EllipseShape
타원 형태의 Shape입니다.

```
{
    // 타원 모양 Shape
    "type": "ellipse",

    // 가로 크기
    "width": number, 

    // 세로 크기
    "height": number, 

    // width과 height를 게임 맵 크기 기준이 아닌 캔버스 크기를 기준으로 사용
    "fixSize": boolean, 

    // 배경 색상
    "fillColor": color, 

    // 배경 투명도
    "fillAlpha": number, 

    // 테두리 색상
    "lineColor": color, 

    // 테두리 투명도
    "lineAlpha": number, 

    // 테두리 두께
    "lineWidth": number, 
}
```

### ImageShape
이미지 Asset을 활용한 Shape입니다.

```
{
    // 이미지 모양 Shape
    "type": "image", 

    // 가로 크기
    "width": number, 

    // 세로 크기
    "height": number, 

    // width과 height를 게임 맵 크기 기준이 아닌 캔버스 크기를 기준으로 사용
    "fixSize": boolean, 

    // 사용할 이미지의 AssetID
    “image": AssetID, 
}
```
