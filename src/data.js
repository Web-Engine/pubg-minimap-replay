{
    let string = '';
    let number = 1.234;
    let integer = 1;
    let boolean = true;

    let Image = '';
    let color = '0xFFFFFF' | 0xFFFFFF | 'white' | 'transparent';

    let Shapes = [
        {
            type: 'image',

            image: Image,

            width: number,
            height: number,
        },

        {
            type: 'oval',

            width: number,
            height: number,

            strokeWidth: number,
            strokeColor: color,

            fillColor: color,

            text: string | null,
            textColor: color,
            textSize: number,

            transition: boolean,
        },

        {
            type: 'rectangle',

            width: number,
            height: number,

            strokeWidth: number,
            strokeColor: color,

            fillColor: color,

            text: string | null,
            textColor: color,
            textSize: number,

            transition: boolean,
        }
    ];

    let data = {
        game: {
            duration: number,
        },

        players: [
            {
                id: string, // identifier of player
                name: string, // player name
                team: integer, // player team id

                locations: [
                    {
                        x: number,
                        y: number,
                        elapsedTime: number,
                    },
                ],

                healths: [
                    {
                        state: 'ALIVE' | 'DEAD',
                        health: number,
                        elapsedTime: number,
                    },
                ],

                manas: [
                    {
                        mana: number,
                        elapsedTime: number,
                    },
                ],

                attacks: [
                    {
                        type: 'projectile',
                        victim: 'Victim player id',
                        duration: number,
                        shape: Shapes,
                        elapsedTime: number,
                    },
                ],

                uses: [
                    {
                        image: '',
                        duration: number,
                        elapsedTime: number,
                    },
                ],

                buffs: [
                    {
                        image: '',
                        duration: number,
                        elapsedTime: number,
                    },
                ],

                items: [
                    {
                        items: [
                            {
                                name: 'Item Name',
                                image: Image,
                            }
                        ],
                        elapsedTime: number,
                    },
                ],

                shapes: Shapes,
            },
        ],

        objects: [
            {
                id: string,
                name: string | null,
                team: string | null,

                locations: [
                    {
                        x: number,
                        y: number,
                        elapsedTime: number,
                    },
                ],

                healths: [
                    {
                        state: ALIVE, DEAD,
                        health: number,
                        elapsedTime: number,
                    }
                ],

                shapes: Shapes,
            }
        ],

        ui: [
            {
                locations: [
                    {
                        x: number,
                        y: number,
                        elapsedTime: number,
                    },
                ],

                shapes: Shapes,
            },
        ],

        zoom: {
            min: number,
            max: number,
            controller: boolean,
            wheel: boolean,
        },

        pan: boolean,
    }
}