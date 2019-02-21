AV.init('s44XmGNmCEiM7brKGRrazhkt-gzGzoHsz', 'tKNAMwNeMwEcHQlP0u1YyIrm');
var LcEntity = function (entityName) {
    if (typeof (AV) === "undefined") {
        console.warn("LcEntity requires AV");
        return;
    }
    var Entity = AV.Object.extend(entityName);

    this.GetById = function (objectId) {
        var args = { where: { objectId: objectId } };
        return this.FirstOrDefault(args);
    }
    this.FirstOrDefault = function (args) {
        args = args || {};
        args.pageSize = 1;
        return this.GetList(args).then(function (list) {
            return list.length > 0 ? list[0] : {};
        });
    };
    this.GetList = function (args) {
        var query = new AV.Query(entityName);

        args = args || {};
        args.where = args.where || {};
        args.orWhere = args.orWhere || {};
        args.orderby = args.orderby || "createdAt";
        args.pageSize = args.pageSize || 20;
        args.pageIndex = args.pageIndex || 1;
        args.like = args.like || {};
        for (var key in args.like) {
            var orQuery = new AV.Query(entityName);
            var keys = key.split('|');
            var val = args.like[key];
            orQuery.contains(keys[0], val);
            for (var i = 1; i < keys.length; i++) {
                var tempOrQuery = new AV.Query(entityName);
                tempOrQuery.contains(keys[i], val);
                orQuery = AV.Query.or(tempOrQuery, orQuery);
            }
            query = AV.Query.and(query, orQuery);

        }
        for (var key in args.where) {
            var val = args.where[key];
            query.equalTo(key, val);
        }
        var hasInitOrWhere = false;
        var tempOrWhereQuery = new AV.Query(entityName);
        
        for (var key in args.orWhere) {
            var val = args.orWhere[key];
            for (var i in val) {
                var _tempOrWhereQuery = new AV.Query(entityName);
                _tempOrWhereQuery.equalTo(key, val[i]);
                tempOrWhereQuery = hasInitOrWhere ? AV.Query.or(tempOrWhereQuery, _tempOrWhereQuery) : _tempOrWhereQuery;
                hasInitOrWhere = true;
            }
        }

        query = AV.Query.and(query, tempOrWhereQuery);

        query.descending(args.orderby);
        query.limit(args.pageSize);
        query.skip(args.pageSize * args.pageIndex - args.pageSize);
        var p = new Promise(function (resolve, reject) {
            query.find().then(function (result) {
                var list = [];
                for (var i = 0; i < result.length; i++) {
                    var entity = result[i].attributes;
                    entity.objectId = result[i].id;
                    list.push(entity);
                }
                resolve(list);
            }).catch(function (error) {
                reject = reject || console.log;
                reject(error);
            });
        });
        return p;
    };
    this.RemoveById = function (objectId) {
        var todoObj = AV.Object.createWithoutData(entityName, objectId);
        return todoObj.destroy();
    };
    this.Update = function (entity) {
        var existingEntity = AV.Object.createWithoutData(entityName, entity.objectId);
        for (var key in entity) {
            if (key !== 'objectId' && /^[a-zA-Z0-9_]+$/.test(key)) {
                existingEntity.set(key, entity[key]);
            }
        }
        return existingEntity.save();
    };
    this.Add = function (entityObj) {
        var entity = new Entity();
        return entity.save(entityObj);
    };
    this.AddOrUpdate = function (entity) {
        entity.updateTime = new Date();
        return entity.objectId ? this.Update(entity) : this.Add(entity);
    };
};
