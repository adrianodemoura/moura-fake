/*!
 * moura-fake
 * Copyright(c) 2019 Adriano Moura
 * MIT Licensed
 */
'use strict'
/**
 * Mantém os dados fake de uma tabela
 */
class fake {
	/**
	 * Método start
	 */
	constructor(db='', table='') {
        this.db     = null
        this.table  = ''
        this.alias  = this.table
        this.schema = {}
        this.types  = {
            'string': ['varchar', 'char', 'varchar2', 'character'],
            'number': ['int', 'integer', 'tinyint', 'numeric', 'float', 'double']
        }
    }

    /** 
     * Método start
     *
     * @param   {String}    table   Nome da tabela
     * @param   {Object}    db      Instância com banco de dados
     * @param   {String}    alias   Alias para a tabela
     */
    async init(table='', db='', alias='') {
        this.table  = table
        this.alias  = alias
        if (!alias.length) {
            this.alias = table
        }
        this.db     = db

        this.schema = await this.db.getAllFields(this.table)
    }
    
    /**
     * Verifica se o tipo é númerico ou texto.
     * 
     * @param {type} type  Tipo a ser testado
     */
    getGenericType(type='') {
        if (this.types.number.indexOf(type) >-1) {
            return 'numeric'
        }
        if (this.types.string.indexOf(type) >-1) {
            return 'string'
        }
    }

    /**
     * Retorna os dados fake de uma tabela
     * 
     * @param   {Integer}   tot         Total de registros fake.
     * @param   {Integer}   inc         Incremento inicial
     * @param   {Boolean}   includePk   Se verdadeiro vai incluir valor da primarykey, se não ignora o campo.
     * @return  {Json}      json        Objeto com dados do campo 
     */
    async getData(tot=0, inc=1, includePk=false) {
        let data = {}

        for (let field in this.schema) {
            let pk      = !!!this.schema[field].pk      ? false : true
            let type    = !!!this.schema[field].type    ? 'string' : this.schema[field].type
            let width   = !!!this.schema[field].width   ? 0 : this.schema[field].width
            let list    = !!!this.schema[field].list    ? [] : this.schema[field].list
            let chaves  = Object.keys(list)
            let between = !!!this.schema[field].between ? [] : this.schema[field].between
            let genericType = this.getGenericType(type)
            let vlr     = ''

            if (includePk === false && pk === true) {
                continue
            }

            for (let i = 0; i<tot; i++) {
                switch (genericType) {
                    case 'numeric':
                        vlr = 0
                        if (chaves.length>0) {
                            let tamanho     = chaves.length
                            let chave       = list[tamanho]
                            let randomico   = Math.floor(Math.random()*tamanho)

                            vlr = parseInt(chaves[randomico])
                        }

                        if (between.length>0) {
                            vlr = Math.floor(Math.random() * (between[1] - between[0] + 1)) + between[0]
                        }

                        break
                    default:
                        vlr = field+' '+(inc+i)+' '
                        vlr = vlr.repeat(width).substr(0,width).trim()
                }

                // criando o campo
                if (!!!data[i]) {
                    data[i] = {}
                    data[i][this.alias] = {}
                }

                if (pk === true) {
                    vlr = (inc+i)
                }

                data[i][this.alias][field] = vlr
            }
        }

        return data
    }
}

module.exports = new fake